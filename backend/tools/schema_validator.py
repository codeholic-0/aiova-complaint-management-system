from pydantic import BaseModel, Field
from typing import Optional, List


class ComplaintFormSchema(BaseModel):
    source: Optional[str] = None
    customer_name: Optional[str] = None
    product_name: Optional[str] = None
    strength: Optional[str] = None
    batch_lot: Optional[str] = None
    mfg_date: Optional[str] = None
    expiry_date: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = "kg"
    complaint_type: Optional[str] = None
    complaint_date: Optional[str] = None
    description: Optional[str] = None


class RiskAssessmentSchema(BaseModel):
    severity: Optional[str] = None
    priority: Optional[str] = None
    risk_category: Optional[str] = None
    recommended_actions: List[str] = Field(default_factory=list)
    regulatory_impact: Optional[str] = None
    next_steps: Optional[str] = None


def validate_form(data: dict) -> dict:
    return ComplaintFormSchema(**data).model_dump(exclude_none=True)


def validate_assessment(data: dict) -> dict:
    return RiskAssessmentSchema(**data).model_dump(exclude_none=True)