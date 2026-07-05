"""Storage layer — 以 SQLAlchemy 作為儲存抽象介面。

預設使用 SQLite（local storage，零依賴、單檔即資料庫），
未來切換 PostgreSQL / MariaDB 僅需改 DATABASE_URL 環境變數，
上層 routers / services 完全不需改動：

    SQLite     (預設):  sqlite:///./tmic.db
    PostgreSQL       :  postgresql://user:pass@host:5432/bobatea   (pip install psycopg2-binary)
    MariaDB / MySQL  :  mysql+pymysql://user:pass@host:3306/bobatea (pip install pymysql)
"""
import os
from datetime import datetime, timezone

from sqlalchemy import JSON, Column, DateTime, Float, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tmic.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Connector(Base):
    __tablename__ = "connector_registry"

    connector_id = Column(String(128), primary_key=True)
    connector_type = Column(String(32), default="prompt_chain", index=True)  # prompt_chain | api_crawler
    version = Column(String(32), default="0.1")
    owner = Column(String(128), default="")
    description = Column(Text, default="")
    status = Column(String(32), default="draft")  # draft | published
    spec = Column(JSON, nullable=False)  # 完整 chain DSL（dict）
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)


class UsageRecord(Base):
    __tablename__ = "ai_usage_ledger"

    id = Column(Integer, primary_key=True, autoincrement=True)
    chain_id = Column(String(128), index=True)
    run_id = Column(String(128), index=True)
    stage_id = Column(String(128))
    provider = Column(String(64))
    model = Column(String(64))
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    cost_usd = Column(Float, default=0.0)
    called_at = Column(DateTime, default=utcnow)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
