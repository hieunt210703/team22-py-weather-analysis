from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from weather_analysis.models import Location


class LocationRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list_all(self) -> list[Location]:
        return list(self._session.scalars(select(Location).order_by(Location.name)))

    def list_pinned(self) -> list[Location]:
        statement = (
            select(Location)
            .where(Location.pin_order.is_not(None))
            .order_by(Location.pin_order)
        )
        return list(self._session.scalars(statement))

    def count(self) -> int:
        return self._session.scalar(select(func.count()).select_from(Location)) or 0

    def replace_all(self, locations: list[Location]) -> None:
        self._session.execute(delete(Location))
        self._session.add_all(locations)
        self._session.flush()
