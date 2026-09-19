from sqlalchemy.orm import Session

from weather_analysis.services.auth_service import authenticate


def test_authenticate_returns_user_for_correct_credentials(
    session: Session,
) -> None:
    user = authenticate(session, "admin", "adminpw")

    assert user is not None
    assert user.username == "admin"


def test_authenticate_rejects_incorrect_password(session: Session) -> None:
    assert authenticate(session, "admin", "sai-mat-khau") is None


def test_authenticate_rejects_unknown_user(session: Session) -> None:
    assert authenticate(session, "khong-ton-tai", "adminpw") is None
