import time
import uuid
from datetime import date
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.assistant.outputs import Citation, GroundedAnswer
from app.auth.dependencies import CurrentUser
from app.chat.orchestrator import run_turn
from app.retrieval.types import RetrievedPassage
from app.schemas.chat import TextPart, UIMessage


def _passage() -> RetrievedPassage:
    return RetrievedPassage(
        chunk_id=uuid.uuid4(),
        document_id=uuid.uuid4(),
        chunk_index=0,
        text="Azure revenue increased 29%.",
        page="5",
        section="MD&A",
        fusion_score=0.7,
        ticker="MSFT",
        company_name="Microsoft Corporation",
        form="10-K",
        filing_date=date(2024, 7, 30),
        fiscal_year=2024,
        accession_number="0000789019-24-000012",
    )


@pytest.mark.anyio
async def test_run_turn_streams_grounded_answer_and_persists() -> None:
    passage = _passage()
    grounded = GroundedAnswer(
        answer="Azure grew [1].",
        citations=[
            Citation(
                citation_index=1,
                chunk_id=passage.chunk_id,
                excerpt="Azure revenue increased 29%.",
            )
        ],
    )
    user_message = UIMessage(role="user", parts=[TextPart(text="Azure growth?")])
    events: list[str] = []

    def fake_run(query: str, deps) -> GroundedAnswer:
        deps.emit_status("searching", "Searching SEC filings…")
        time.sleep(0.05)
        deps.registry.register(passage)
        return grounded

    with (
        patch("app.chat.orchestrator.run_document_agent", fake_run),
        patch(
            "app.chat.streaming.append_grounded_turn",
            AsyncMock(),
        ) as mock_persist,
    ):
        async for event in run_turn(
            client=MagicMock(),
            thread_id=uuid.uuid4(),
            user=CurrentUser(id=uuid.uuid4(), email="a@example.com"),
            user_message=user_message,
            thread_title="New chat",
            retriever=MagicMock(),
        ):
            events.append(event)

    assert events[0].startswith('data: {"type":"data-status"')
    assert any('"stage":"searching"' in event for event in events)
    assert any('"type":"text-delta"' in event for event in events)
    assert any('"type":"data-citation"' in event for event in events)
    mock_persist.assert_awaited_once()
    persisted = mock_persist.await_args.kwargs["assistant_message"]
    part_types = {part.type for part in persisted.parts}
    assert "data-status" not in part_types


@pytest.mark.anyio
async def test_run_turn_validation_failure_does_not_persist() -> None:
    grounded = GroundedAnswer(
        answer="Bad answer without markers.",
        citations=[
            Citation(
                citation_index=1,
                chunk_id=uuid.uuid4(),
                excerpt="missing from registry",
            )
        ],
    )
    user_message = UIMessage(role="user", parts=[TextPart(text="Question")])

    with (
        patch("app.chat.orchestrator.run_document_agent", return_value=grounded),
        patch("app.chat.streaming.append_grounded_turn", AsyncMock()) as mock_persist,
    ):
        events = [
            event
            async for event in run_turn(
                client=MagicMock(),
                thread_id=uuid.uuid4(),
                user=CurrentUser(id=uuid.uuid4(), email="a@example.com"),
                user_message=user_message,
                thread_title="New chat",
                retriever=MagicMock(),
            )
        ]

    assert any('"type":"error"' in event for event in events)
    mock_persist.assert_not_awaited()
