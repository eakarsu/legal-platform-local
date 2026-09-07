import React, { useState } from 'react';
import api from '../services/api';
import Toast from '../components/Toast';

const aiFeatures = [
  { id: 'case-assessment', icon: 'fa-solid fa-gavel', title: 'AI Case Assessment', desc: 'Get AI-powered analysis of case strength and recommendations' },
  { id: 'document-analysis', icon: 'fa-solid fa-file-magnifying-glass', title: 'AI Document Analysis', desc: 'Analyze documents for completeness and compliance' },
  { id: 'legal-research', icon: 'fa-solid fa-book-open', title: 'AI Legal Research', desc: 'Research immigration laws, regulations, and precedents' },
  { id: 'form-assist', icon: 'fa-solid fa-file-pen', title: 'AI Form Assistant', desc: 'Get help filling out immigration forms correctly' },
  { id: 'translate', icon: 'fa-solid fa-language', title: 'AI Translation', desc: 'Translate documents for immigration purposes' },
  { id: 'compliance-check', icon: 'fa-solid fa-clipboard-check', title: 'AI Compliance Check', desc: 'Verify case compliance with immigration regulations' },
  { id: 'status-prediction', icon: 'fa-solid fa-crystal-ball', title: 'AI Status Prediction', desc: 'Predict processing times and case outcomes' },
  { id: 'document-ocr', icon: 'fa-solid fa-camera', title: 'Document OCR & Extraction', desc: 'Upload passport/I-94/visa images and AI extracts structured data automatically' },
  { id: 'deadline-predict', icon: 'fa-solid fa-calendar-check', title: 'Deadline Predictor', desc: 'AI predicts USCIS processing timeline and auto-creates deadline entries for a case' },
];

const riskColors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
const urgencyColors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };

function GaugeBar({ value, label, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: color || 'var(--primary-light)' }}>{value}%</span>
      </div>
      <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color || 'var(--primary-light)', borderRadius: 4, transition: 'width 0.5s' }} />
      </div>
    </div>
  );
}

function StructuredCaseAssessment({ data }) {
  if (!data) return null;
  const risk = data.risk_level || 'unknown';
  return (
    <div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ padding: '12px 20px', borderRadius: 8, background: riskColors[risk] + '22', border: `2px solid ${riskColors[risk]}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="fa-solid fa-shield-halved" style={{ color: riskColors[risk] }}></i>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Risk Level</div>
            <div style={{ fontWeight: 700, color: riskColors[risk], textTransform: 'capitalize' }}>{risk}</div>
          </div>
        </div>
        <div style={{ padding: '12px 20px', borderRadius: 8, background: 'var(--primary-bg)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Timeline Estimate</div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{data.timeline_estimate || '—'}</div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <GaugeBar value={data.approval_probability || 0} label="Approval Probability" color="#22c55e" />
        <GaugeBar value={data.rfe_likelihood || 0} label="RFE Likelihood" color="#f59e0b" />
      </div>

      {data.key_factors?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>KEY FACTORS</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {data.key_factors.map((f, i) => (
              <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 14, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <i className="fa-solid fa-circle-check" style={{ color: '#22c55e', marginTop: 2 }}></i>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.recommended_actions?.length > 0 && (
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>RECOMMENDED ACTIONS</h4>
          <ol style={{ paddingLeft: 20, margin: 0 }}>
            {data.recommended_actions.map((a, i) => (
              <li key={i} style={{ padding: '4px 0', fontSize: 14 }}>{a}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function StructuredComplianceCheck({ data }) {
  if (!data) return null;
  const compliant = data.compliant;
  const urgency = data.urgency || 'low';
  return (
    <div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ padding: '12px 20px', borderRadius: 8, background: compliant ? '#22c55e22' : '#ef444422', border: `2px solid ${compliant ? '#22c55e' : '#ef4444'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className={`fa-solid ${compliant ? 'fa-circle-check' : 'fa-circle-xmark'}`} style={{ color: compliant ? '#22c55e' : '#ef4444' }}></i>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Status</div>
            <div style={{ fontWeight: 700, color: compliant ? '#22c55e' : '#ef4444' }}>{compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}</div>
          </div>
        </div>
        <div style={{ padding: '12px 20px', borderRadius: 8, background: urgencyColors[urgency] + '22', border: `1px solid ${urgencyColors[urgency]}` }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Urgency</div>
          <div style={{ fontWeight: 700, color: urgencyColors[urgency], textTransform: 'capitalize' }}>{urgency}</div>
        </div>
      </div>

      {data.violations?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#ef4444' }}>VIOLATIONS</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {data.violations.map((v, i) => (
              <li key={i} style={{ padding: '6px 10px', background: '#ef444411', borderRadius: 6, marginBottom: 6, fontSize: 14, color: '#ef4444', display: 'flex', gap: 8 }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginTop: 2 }}></i>
                {v}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.recommendations?.length > 0 && (
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>RECOMMENDATIONS</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {data.recommendations.map((r, i) => (
              <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 14, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <i className="fa-solid fa-lightbulb" style={{ color: '#f59e0b', marginTop: 2 }}></i>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StructuredStatusPrediction({ data }) {
  if (!data) return null;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>NEXT MILESTONE</div>
          <div style={{ fontWeight: 600 }}>{data.next_milestone || '—'}</div>
        </div>
        <div style={{ padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>EST. COMPLETION</div>
          <div style={{ fontWeight: 600 }}>{data.estimated_completion || '—'}</div>
        </div>
      </div>

      {data.current_status_interpretation && (
        <div style={{ padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>STATUS INTERPRETATION</div>
          <p style={{ margin: 0, fontSize: 14 }}>{data.current_status_interpretation}</p>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <GaugeBar value={data.approval_probability || 0} label="Approval Probability" color="#22c55e" />
        <GaugeBar value={data.rfe_probability || 0} label="RFE Probability" color="#f59e0b" />
      </div>

      {data.potential_issues?.length > 0 && (
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>POTENTIAL ISSUES</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {data.potential_issues.map((issue, i) => (
              <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 14, display: 'flex', gap: 8 }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: '#f59e0b', marginTop: 2 }}></i>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function RawTextResult({ content }) {
  if (!content) return null;
  return (
    <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', fontFamily: 'inherit' }}>
      {content}
    </div>
  );
}

function AIFeatures() {
  const [activeFeature, setActiveFeature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  const [caseForm, setCaseForm] = useState({ case_type: '', client_nationality: '', current_status: '', description: '' });
  const [docForm, setDocForm] = useState({ document_type: '', document_content: '', case_type: '' });
  const [researchForm, setResearchForm] = useState({ research_topic: '', case_context: '' });
  const [formAssistForm, setFormAssistForm] = useState({ form_type: '', client_info: '', questions: '' });
  const [translateForm, setTranslateForm] = useState({ text: '', source_language: '', target_language: 'English' });
  const [complianceForm, setComplianceForm] = useState({ case_type: '', case_details: '', documents_submitted: '' });
  const [predictionForm, setPredictionForm] = useState({ case_type: '', filing_date: '', service_center: '', case_details: '' });
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrCaseId, setOcrCaseId] = useState('');
  const [deadlineCaseId, setDeadlineCaseId] = useState('');

  const handleSubmit = async (endpoint, data) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post(`/ai/${endpoint}`, data);
      setResult(res.data);
    } catch (err) {
      if (err.response?.status === 429) {
        setToast({ message: 'AI request limit reached. Please wait.', type: 'error' });
      } else {
        setToast({ message: err.response?.data?.error || 'AI request failed. Check your OpenRouter API key.', type: 'error' });
      }
    }
    setLoading(false);
  };

  const handleOcrSubmit = async () => {
    if (!ocrFile) { setToast({ message: 'Please select an image file', type: 'error' }); return; }
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', ocrFile);
      if (ocrCaseId) formData.append('case_id', ocrCaseId);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/document-ocr', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OCR failed');
      setResult(data);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
    setLoading(false);
  };

  const renderStructuredResult = () => {
    if (!result) return null;
    const { structured, raw } = result;

    if (activeFeature === 'case-assessment' && structured) {
      return <StructuredCaseAssessment data={structured} />;
    }
    if (activeFeature === 'compliance-check' && structured) {
      return <StructuredComplianceCheck data={structured} />;
    }
    if (activeFeature === 'status-prediction' && structured) {
      return <StructuredStatusPrediction data={structured} />;
    }

    // Document OCR structured display
    if (activeFeature === 'document-ocr' && result.structured) {
      const d = result.structured;
      return (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[['Document Type', d.document_type], ['Applicant Name', d.applicant_name], ['A-Number', d.a_number], ['Receipt Number', d.receipt_number], ['Status', d.status]].filter(([,v]) => v).map(([label, value]) => (
              <div key={label} style={{ padding: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{label.toUpperCase()}</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{value}</div>
              </div>
            ))}
          </div>
          {d.important_notes?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Important Notes</h4>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 14, lineHeight: 1.7 }}>
                {d.important_notes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          )}
          {d.extracted_text && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ fontSize: 13, cursor: 'pointer', color: 'var(--text-secondary)' }}>View extracted text</summary>
              <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', marginTop: 8, padding: 12, background: 'var(--bg)', borderRadius: 8 }}>{d.extracted_text}</pre>
            </details>
          )}
        </div>
      );
    }

    // Deadline predict structured display
    if (activeFeature === 'deadline-predict' && result.structured) {
      const d = result.structured;
      return (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>ESTIMATED DECISION DATE</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{d.estimated_decision_date || '—'}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>CONFIDENCE</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{d.confidence || 0}%</div>
            </div>
          </div>
          {d.key_deadlines?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>KEY DEADLINES (auto-created)</h4>
              {d.key_deadlines.map((dl, i) => (
                <div key={i} style={{ padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 8, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ padding: '2px 10px', background: 'var(--primary-bg)', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{dl.date}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{dl.event}</div>
                    {dl.description && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{dl.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {d.recommended_actions_now?.length > 0 && (
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>RECOMMENDED ACTIONS NOW</h4>
              <ol style={{ paddingLeft: 20, margin: 0, fontSize: 14, lineHeight: 1.7 }}>
                {d.recommended_actions_now.map((a, i) => <li key={i}>{a}</li>)}
              </ol>
            </div>
          )}
        </div>
      );
    }

    // Fallback: show raw text for non-structured responses
    const text = raw || result.assessment || result.analysis || result.research || result.assistance || result.translation || result.compliance || result.prediction || result;
    return <RawTextResult content={typeof text === 'string' ? text : JSON.stringify(text, null, 2)} />;
  };

  const renderFeatureForm = () => {
    switch (activeFeature) {
      case 'case-assessment':
        return (
          <div>
            <div className="form-row">
              <div className="form-group"><label>Case Type</label><input value={caseForm.case_type} onChange={e => setCaseForm({...caseForm, case_type: e.target.value})} placeholder="e.g. H-1B Petition" /></div>
              <div className="form-group"><label>Client Nationality</label><input value={caseForm.client_nationality} onChange={e => setCaseForm({...caseForm, client_nationality: e.target.value})} placeholder="e.g. Indian" /></div>
            </div>
            <div className="form-group"><label>Current Immigration Status</label><input value={caseForm.current_status} onChange={e => setCaseForm({...caseForm, current_status: e.target.value})} placeholder="e.g. F-1 OPT" /></div>
            <div className="form-group"><label>Case Description</label><textarea value={caseForm.description} onChange={e => setCaseForm({...caseForm, description: e.target.value})} placeholder="Describe the case details..." /></div>
            <button className="btn btn-primary btn-lg" onClick={() => handleSubmit('case-assessment', caseForm)} disabled={loading}><i className="fa-solid fa-robot"></i> Analyze Case</button>
          </div>
        );
      case 'document-analysis':
        return (
          <div>
            <div className="form-row">
              <div className="form-group"><label>Document Type</label><input value={docForm.document_type} onChange={e => setDocForm({...docForm, document_type: e.target.value})} placeholder="e.g. I-129, Passport" /></div>
              <div className="form-group"><label>Related Case Type</label><input value={docForm.case_type} onChange={e => setDocForm({...docForm, case_type: e.target.value})} placeholder="e.g. H-1B Petition" /></div>
            </div>
            <div className="form-group"><label>Document Content/Description</label><textarea value={docForm.document_content} onChange={e => setDocForm({...docForm, document_content: e.target.value})} placeholder="Paste document content or describe the document..." style={{ minHeight: 150 }} /></div>
            <button className="btn btn-primary btn-lg" onClick={() => handleSubmit('document-analysis', docForm)} disabled={loading}><i className="fa-solid fa-robot"></i> Analyze Document</button>
          </div>
        );
      case 'legal-research':
        return (
          <div>
            <div className="form-group"><label>Research Topic</label><input value={researchForm.research_topic} onChange={e => setResearchForm({...researchForm, research_topic: e.target.value})} placeholder="e.g. H-1B specialty occupation requirements" /></div>
            <div className="form-group"><label>Case Context</label><textarea value={researchForm.case_context} onChange={e => setResearchForm({...researchForm, case_context: e.target.value})} placeholder="Provide context about the specific case..." /></div>
            <button className="btn btn-primary btn-lg" onClick={() => handleSubmit('legal-research', researchForm)} disabled={loading}><i className="fa-solid fa-robot"></i> Research</button>
          </div>
        );
      case 'form-assist':
        return (
          <div>
            <div className="form-group"><label>Form Type</label><input value={formAssistForm.form_type} onChange={e => setFormAssistForm({...formAssistForm, form_type: e.target.value})} placeholder="e.g. I-129, I-485, N-400" /></div>
            <div className="form-group"><label>Client Information</label><textarea value={formAssistForm.client_info} onChange={e => setFormAssistForm({...formAssistForm, client_info: e.target.value})} placeholder="Name, nationality, status, relevant details..." /></div>
            <div className="form-group"><label>Specific Questions</label><textarea value={formAssistForm.questions} onChange={e => setFormAssistForm({...formAssistForm, questions: e.target.value})} placeholder="What specific questions do you need help with?" /></div>
            <button className="btn btn-primary btn-lg" onClick={() => handleSubmit('form-assist', formAssistForm)} disabled={loading}><i className="fa-solid fa-robot"></i> Get Assistance</button>
          </div>
        );
      case 'translate':
        return (
          <div>
            <div className="form-row">
              <div className="form-group"><label>Source Language</label><input value={translateForm.source_language} onChange={e => setTranslateForm({...translateForm, source_language: e.target.value})} placeholder="e.g. Spanish, Chinese" /></div>
              <div className="form-group"><label>Target Language</label><input value={translateForm.target_language} onChange={e => setTranslateForm({...translateForm, target_language: e.target.value})} placeholder="e.g. English" /></div>
            </div>
            <div className="form-group"><label>Text to Translate</label><textarea value={translateForm.text} onChange={e => setTranslateForm({...translateForm, text: e.target.value})} placeholder="Enter text to translate..." style={{ minHeight: 150 }} /></div>
            <button className="btn btn-primary btn-lg" onClick={() => handleSubmit('translate', translateForm)} disabled={loading}><i className="fa-solid fa-robot"></i> Translate</button>
          </div>
        );
      case 'compliance-check':
        return (
          <div>
            <div className="form-group"><label>Case Type</label><input value={complianceForm.case_type} onChange={e => setComplianceForm({...complianceForm, case_type: e.target.value})} placeholder="e.g. H-1B, L-1A" /></div>
            <div className="form-group"><label>Case Details</label><textarea value={complianceForm.case_details} onChange={e => setComplianceForm({...complianceForm, case_details: e.target.value})} placeholder="Describe the case details..." /></div>
            <div className="form-group"><label>Documents Submitted</label><textarea value={complianceForm.documents_submitted} onChange={e => setComplianceForm({...complianceForm, documents_submitted: e.target.value})} placeholder="List all documents that have been submitted..." /></div>
            <button className="btn btn-primary btn-lg" onClick={() => handleSubmit('compliance-check', complianceForm)} disabled={loading}><i className="fa-solid fa-robot"></i> Check Compliance</button>
          </div>
        );
      case 'status-prediction':
        return (
          <div>
            <div className="form-row">
              <div className="form-group"><label>Case Type</label><input value={predictionForm.case_type} onChange={e => setPredictionForm({...predictionForm, case_type: e.target.value})} placeholder="e.g. H-1B, EB-2 NIW" /></div>
              <div className="form-group"><label>Filing Date</label><input type="date" value={predictionForm.filing_date} onChange={e => setPredictionForm({...predictionForm, filing_date: e.target.value})} /></div>
            </div>
            <div className="form-group"><label>Service Center</label><input value={predictionForm.service_center} onChange={e => setPredictionForm({...predictionForm, service_center: e.target.value})} placeholder="e.g. USCIS Texas Service Center" /></div>
            <div className="form-group"><label>Case Details</label><textarea value={predictionForm.case_details} onChange={e => setPredictionForm({...predictionForm, case_details: e.target.value})} placeholder="Describe the case..." /></div>
            <button className="btn btn-primary btn-lg" onClick={() => handleSubmit('status-prediction', predictionForm)} disabled={loading}><i className="fa-solid fa-robot"></i> Predict Status</button>
          </div>
        );
      case 'document-ocr':
        return (
          <div>
            <div className="form-group">
              <label>Upload Document Image (JPEG/PNG/GIF) or PDF</label>
              <input type="file" accept="image/*,.pdf" onChange={e => setOcrFile(e.target.files[0])} style={{ marginTop: 8 }} />
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>Upload a passport, I-94, visa, or other immigration document. AI will extract structured data.</p>
            </div>
            <div className="form-group">
              <label>Case ID (optional — auto-link document to case)</label>
              <input value={ocrCaseId} onChange={e => setOcrCaseId(e.target.value)} placeholder="e.g. 42" type="number" />
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleOcrSubmit} disabled={loading}>
              <i className="fa-solid fa-robot"></i> Extract Document Data
            </button>
          </div>
        );
      case 'deadline-predict':
        return (
          <div>
            <div className="form-group">
              <label>Case ID</label>
              <input value={deadlineCaseId} onChange={e => setDeadlineCaseId(e.target.value)} placeholder="Enter Case ID from Cases page" type="number" />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              AI will pull the case details from the database, predict the USCIS processing timeline, and automatically create deadline entries in the Deadlines module.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => handleSubmit('deadline-predict', { case_id: parseInt(deadlineCaseId) })} disabled={loading || !deadlineCaseId}>
              <i className="fa-solid fa-robot"></i> Predict Deadlines
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>AI Assistant</h1><p>AI-powered immigration tools using OpenRouter</p></div>
        {activeFeature && (
          <button className="btn btn-secondary" onClick={() => { setActiveFeature(null); setResult(null); }}>
            <i className="fa-solid fa-arrow-left"></i> Back to Tools
          </button>
        )}
      </div>

      {!activeFeature ? (
        <div className="ai-feature-grid">
          {aiFeatures.map(f => (
            <div key={f.id} className="ai-feature-card" onClick={() => setActiveFeature(f.id)}>
              <h3><i className={f.icon} style={{ color: 'var(--primary-light)' }}></i> {f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 32, marginBottom: 24 }}>
            <h2 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className={aiFeatures.find(f => f.id === activeFeature)?.icon} style={{ color: 'var(--primary-light)' }}></i>
              {aiFeatures.find(f => f.id === activeFeature)?.title}
            </h2>
            {renderFeatureForm()}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: 40, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <i className="fa-solid fa-robot fa-spin" style={{ fontSize: 32, color: 'var(--primary-light)', marginBottom: 12 }}></i>
              <p>AI is analyzing your request...</p>
            </div>
          )}

          {result && !loading && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 32 }}>
              <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-robot" style={{ color: 'var(--primary-light)' }}></i>
                {aiFeatures.find(f => f.id === activeFeature)?.title} Results
              </h3>
              {renderStructuredResult()}
            </div>
          )}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default AIFeatures;
