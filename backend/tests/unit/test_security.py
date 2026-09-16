from weather_analysis.security import hash_password, verify_password


def test_hash_password_does_not_store_plaintext_and_uses_random_salt() -> None:
    first_hash = hash_password("matkhau")
    second_hash = hash_password("matkhau")

    assert first_hash != "matkhau"
    assert first_hash != second_hash


def test_verify_password_accepts_correct_password() -> None:
    password_hash = hash_password("matkhau")

    assert verify_password("matkhau", password_hash)


def test_verify_password_rejects_incorrect_password() -> None:
    password_hash = hash_password("matkhau")

    assert not verify_password("sai-mat-khau", password_hash)
