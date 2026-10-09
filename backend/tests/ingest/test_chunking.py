from __future__ import annotations

from pathlib import Path

import pytest

from ingest.chunking import (
    CHUNK_MAX_TOKENS,
    build_hierarchical_chunker,
    build_hybrid_chunker,
    chunk_document,
    convert_html_to_document,
    map_chunk_record,
)

FILING_METADATA = {
    "ticker": "TEST",
    "cik": "0000000000",
    "company_name": "Test Corp",
    "form": "10-K",
    "filing_date": "2021-01-01",
    "report_date": "2020-12-31",
    "fiscal_year": 2020,
    "accession_number": "0000000000-21-000001",
    "primary_document": "test.htm",
    "source_url": "https://example.com/test.htm",
}


@pytest.fixture(scope="module")
def sample_html_path(tmp_path_factory: pytest.TempPathFactory) -> Path:
    fixture_dir = tmp_path_factory.mktemp("fixtures")
    html_path = fixture_dir / "sample_filing.htm"
    html_path.write_text(
        """
        <html><body>
        <h1>UNITED STATES SECURITIES AND EXCHANGE COMMISSION</h1>
        <h2>Item 1. Business</h2>
        <p>We design and sell consumer electronics products worldwide.</p>
        <h2>Item 1A. Risk Factors</h2>
        <p>Our business depends on global supply chains and may be affected by shortages.</p>
        <table>
          <tr><th>Segment</th><th>Revenue</th></tr>
          <tr><td>Products</td><td>100</td></tr>
          <tr><td>Services</td><td>50</td></tr>
        </table>
        </body></html>
        """,
        encoding="utf-8",
    )
    return html_path


def test_hierarchical_chunker_produces_chunks(sample_html_path: Path) -> None:
    doc = convert_html_to_document(sample_html_path)
    chunker = build_hierarchical_chunker()
    chunks = list(chunker.chunk(dl_doc=doc))
    assert chunks
    combined = "\n".join(chunk.text for chunk in chunks)
    assert "consumer electronics" in combined.lower()


def test_hybrid_chunker_respects_token_limit(sample_html_path: Path) -> None:
    records = chunk_document(sample_html_path, FILING_METADATA)
    assert records
    assert all(record.token_count <= CHUNK_MAX_TOKENS for record in records)


def test_map_chunk_record_extracts_section(sample_html_path: Path) -> None:
    doc = convert_html_to_document(sample_html_path)
    chunker = build_hybrid_chunker()
    chunk = next(chunker.chunk(dl_doc=doc))
    record = map_chunk_record(
        chunk_index=0,
        chunk=chunk,
        chunker=chunker,
        filing_metadata=FILING_METADATA,
    )
    assert record.chunk_index == 0
    assert record.text
    assert record.token_count > 0
    assert record.chunk_metadata["ticker"] == "TEST"
    assert record.chunk_metadata["raw_text"]
    assert record.chunk_metadata["accession_number"] == FILING_METADATA["accession_number"]
