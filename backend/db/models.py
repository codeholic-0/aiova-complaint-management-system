import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Date, Float, JSON, ForeignKey
from db.session import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    source = Column(String(100), nullable=True)
    customer_name = Column(String(255), nullable=True)
    product_name = Column(String(255), nullable=True)
    strength = Column(String(100), nullable=True)
    batch_lot = Column(String(100), nullable=True)
    mfg_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    quantity = Column(Float, nullable=True)
    unit = Column(String(50), default="kg")
    complaint_type = Column(String(100), nullable=True)
    complaint_date = Column(Date, nullable=True)
    description = Column(Text, nullable=True)


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)

    severity = Column(String(50), nullable=True)
    priority = Column(String(50), nullable=True)
    risk_category = Column(String(50), nullable=True)
    recommended_actions = Column(JSON, default=list)
    regulatory_impact = Column(String(255), nullable=True)
    next_steps = Column(Text, nullable=True)


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=True)
    extracted_text = Column(Text, nullable=True)


class ChatLog(Base):
    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=True)
    role = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)