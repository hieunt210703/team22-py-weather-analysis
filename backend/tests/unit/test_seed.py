from sqlalchemy import func, select
from sqlalchemy.orm import Session

from weather_analysis.models import User
from weather_analysis.seed import seed_all


def test_seed_all_is_idempotent(session: Session) -> None:
    seed_all(session)
    seed_all(session)

    user_count = session.scalar(select(func.count()).select_from(User))

    assert user_count == 1
