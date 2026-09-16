import bcrypt


def hash_password(password: str) -> str:
    """Băm mật khẩu với salt ngẫu nhiên."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Kiểm tra mật khẩu với giá trị băm đã lưu."""
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
