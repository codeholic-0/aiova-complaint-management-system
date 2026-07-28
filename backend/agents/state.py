from typing import TypedDict, Optional, List


class FormState(TypedDict, total=False):
    source: str
    customer_name: str
    product_name: str
    strength: str
    batch_lot: str
    mfg_date: str
    expiry_date: str
    quantity: float
    unit: str
    complaint_type: str
    complaint_date: str
    description: str


class AssessmentState(TypedDict, total=False):
    severity: str
    priority: str
    risk_category: str
    recommended_actions: List[str]
    regulatory_impact: str
    next_steps: str


class ComplaintState(TypedDict):
    intent: str
    raw_input: str                       
    extracted_text: str
    form: FormState
    assessment: AssessmentState          
    previous_form: Optional[FormState]
    previous_assessment: Optional[AssessmentState]
    complaint_id: Optional[int]
    reply: str 
    missing_fields: List[str]
    duplicate_info: Optional[str]
    root_cause: Optional[str]
    capa: Optional[str]
    summary: Optional[str]