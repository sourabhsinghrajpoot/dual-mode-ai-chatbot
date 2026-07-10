import hashlib
import logging
import math
import re
from dataclasses import dataclass
from pathlib import Path

from app.config import get_settings

logger = logging.getLogger(__name__)
TOKEN_RE = re.compile(r"[a-z0-9]+")


@dataclass
class RetrievedDocument:
    title: str
    content: str
    score: float
    source: str


class RAGService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.faq_path = Path(self.settings.faq_path)
        self._docs = self._load_docs()

    def _load_docs(self) -> list[RetrievedDocument]:
        docs: list[RetrievedDocument] = []
        for path in sorted(self.faq_path.glob("*.md")):
            text = path.read_text(encoding="utf-8")
            title = text.splitlines()[0].replace("#", "").strip() if text.splitlines() else path.stem
            docs.append(RetrievedDocument(title=title, content=text, score=0.0, source=path.name))
        return docs

    async def ingest(self) -> dict[str, int | str]:
        self._docs = self._load_docs()
        try:
            import chromadb

            client = chromadb.PersistentClient(path=self.settings.chroma_path)
            collection = client.get_or_create_collection("support_faq")
            ids = [hashlib.sha1(doc.source.encode()).hexdigest() for doc in self._docs]
            collection.upsert(
                ids=ids,
                documents=[doc.content for doc in self._docs],
                metadatas=[{"title": doc.title, "source": doc.source} for doc in self._docs],
            )
            return {"documents": len(self._docs), "store": "chroma"}
        except Exception:
            logger.info("Chroma ingest unavailable; lexical retrieval remains active.", exc_info=True)
            return {"documents": len(self._docs), "store": "lexical"}

    async def retrieve(self, query: str, top_k: int = 4) -> list[RetrievedDocument]:
        chroma_results = await self._retrieve_chroma(query, top_k)
        if chroma_results:
            return chroma_results
        return self._retrieve_lexical(query, top_k)

    async def _retrieve_chroma(self, query: str, top_k: int) -> list[RetrievedDocument]:
        try:
            import chromadb

            client = chromadb.PersistentClient(path=self.settings.chroma_path)
            collection = client.get_collection("support_faq")
            results = collection.query(query_texts=[query], n_results=top_k)
            docs = results.get("documents", [[]])[0]
            metas = results.get("metadatas", [[]])[0]
            distances = results.get("distances", [[]])[0]
            return [
                RetrievedDocument(
                    title=meta.get("title", "FAQ"),
                    content=doc,
                    score=max(0.0, 1.0 - float(distance)),
                    source=meta.get("source", "chroma"),
                )
                for doc, meta, distance in zip(docs, metas, distances, strict=False)
            ]
        except Exception:
            return []

    def _retrieve_lexical(self, query: str, top_k: int) -> list[RetrievedDocument]:
        query_terms = TOKEN_RE.findall(query.lower())
        if not query_terms:
            return []
        scored: list[RetrievedDocument] = []
        for doc in self._docs:
            doc_terms = TOKEN_RE.findall(doc.content.lower())
            overlap = sum(doc_terms.count(term) for term in query_terms)
            unique_overlap = len(set(query_terms) & set(doc_terms))
            score = (overlap + unique_overlap * 2) / math.sqrt(max(len(doc_terms), 1))
            if score > 0:
                scored.append(RetrievedDocument(doc.title, doc.content, round(min(score, 1.0), 3), doc.source))
        return sorted(scored, key=lambda item: item.score, reverse=True)[:top_k]
