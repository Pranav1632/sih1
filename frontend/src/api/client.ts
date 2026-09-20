// Sentinel-Transform API Client (Task 1 per BUILD_06_frontend_engineer.md)
// Connects to FastAPI backend at http://localhost:8000
// Implements all 5 endpoints from BUILD.md with typed contracts & offline demo fixture fallback.

export interface ExtractedEntity {
  text: string;
  label: string;
}

export interface SourceChunk {
  chunk_id: string;
  doc_id: string;
  source_name: string;
  source_role: 'PRIMARY' | 'SUPPORTING';
  page_number: number;
  timestamp_start: number | null;
  timestamp_end: number | null;
  char_start: number;
  char_end: number;
  text: string;
  extracted_entities: ExtractedEntity[];
}

export interface EntityDiscrepancy {
  draft_entity: string;
  suggested_source_entity: string | null;
  similarity_score: number;
  status: 'FLAGGED_MISMATCH' | 'UNGROUNDED_NEW_ENTITY';
  deliverable_name?: string;
  section_title?: string;
  source_excerpt?: string;
  page_number?: number;
}

export interface GlobalParams {
  tone: string;
  tone_prompt?: string;
  audience: string;
  audience_persona?: string;
  detail: string;
  words: number;
  priority_doc_id?: string;
  objective: 'generative' | 'heuristic';
  language: string;
  formality: number;
  keywords_must: string[];
  add_on_instruction: string;
  fact_matching_gate: boolean;
  simulate_hard_gate?: boolean;
}

export interface IngestResponse {
  job_id: string;
  source_chunks: SourceChunk[];
}

export interface GenerateResponse {
  job_id: string;
  status: string;
}

export interface StatusResponse {
  job_id?: string;
  status: string;
  hard_gate_triggered: boolean;
  human_approved?: boolean;
  entity_discrepancies: EntityDiscrepancy[];
  draft_outputs?: Record<string, any>;
  source_chunks?: SourceChunk[];
  exported_files?: Record<string, string>;
  claim_verifications?: any[];
  error_message?: string;
}

export interface ReviewConfirmPayload {
  job_id: string;
  human_approved: boolean;
  human_corrections: Record<string, any>;
}

export interface ReviewConfirmResponse {
  status: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Frozen fixtures for standalone demo / offline fallback
export const MOCK_SOURCE_CHUNKS: SourceChunk[] = [
  {
    chunk_id: "doc_01_chunk_01",
    doc_id: "doc_01",
    source_name: "Operation_GhostLatch_Incident_Report.pdf",
    source_role: "PRIMARY",
    page_number: 1,
    timestamp_start: null,
    timestamp_end: null,
    char_start: 0,
    char_end: 410,
    text: "On 03 September 2026, the Cyber Resilience Unit detected unauthorized access attempts against substation control software at two grid facilities. The intrusion exploited an unpatched firmware vulnerability. Two endpoints were confirmed infected.",
    extracted_entities: [
      { text: "Cyber Resilience Unit", label: "ORG" },
      { text: "substation control software", label: "TECH" }
    ]
  },
  {
    chunk_id: "doc_01_chunk_02",
    doc_id: "doc_01",
    source_name: "Operation_GhostLatch_Incident_Report.pdf",
    source_role: "PRIMARY",
    page_number: 3,
    timestamp_start: null,
    timestamp_end: null,
    char_start: 1420,
    char_end: 1890,
    text: "The Directorate of Power Grid Resilience confirmed that all affected substations have since been remediated with emergency firmware patches. No attribution to a named threat actor has been established at this time.",
    extracted_entities: [
      { text: "Directorate of Power Grid Resilience", label: "ORG" }
    ]
  },
  {
    chunk_id: "doc_02_chunk_01",
    doc_id: "doc_02",
    source_name: "OpenSource_News_Summary.pdf",
    source_role: "SUPPORTING",
    page_number: 1,
    timestamp_start: null,
    timestamp_end: null,
    char_start: 0,
    char_end: 300,
    text: "Unverified open-source reporting claims up to 14 endpoints may have been affected in the grid intrusion, though official confirmation is pending.",
    extracted_entities: []
  }
];

export const MOCK_DRAFT_OUTPUTS: Record<string, any> = {
  advisory: {
    advisory_id: "NTRO-ADV-2026-09",
    title: "Firmware Vulnerability Exploited in Substation Control Software",
    severity_level: "HIGH",
    threat_overview: "An unpatched firmware vulnerability was exploited to gain unauthorized access to substation control software at two grid facilities.",
    affected_systems: ["Substation control software", "Grid facility endpoints"],
    indicators_of_compromise: ["Unpatched firmware vulnerability (CVE pending)", "Persistence via scheduled task modification"],
    recommended_mitigations: [
      "Apply emergency firmware patches to all substation control endpoints",
      "Audit scheduled task logs for anomalous access patterns"
    ],
    compliance_and_governance: "Report to Directorate of Grid Power Resilience within 24 hours per standing protocol.",
    cited_chunk_ids: ["doc_01_chunk_01", "doc_01_chunk_02"]
  },
  exec_summary: {
    situation_overview: "A firmware vulnerability was exploited against substation control software, affecting two grid endpoints; remediation is complete.",
    core_findings: [
      "Two endpoints confirmed infected via unpatched firmware vulnerability",
      "Directorate of Power Grid Resilience confirms remediation complete",
      "No threat actor attribution established"
    ],
    strategic_impact: "Limited to two facilities; no cascading grid failure observed.",
    decisions_required: ["Approve mandatory firmware patch rollout schedule"],
    confidence_assessment: "HIGH",
    cited_chunk_ids: ["doc_01_chunk_01", "doc_01_chunk_02"]
  },
  linkedin: {
    headline: "Grid Resilience in Action: Rapid Response to Firmware Exploit",
    opening_hook: "Two grid endpoints. One unpatched vulnerability. A same-day remediation.",
    body_paragraphs: [
      "Critical infrastructure demands uncompromising speed. When unauthorized access attempts targeted substation control software, detection and emergency isolation occurred within hours.",
      "Zero cascading failures were sustained thanks to rapid defense countermeasures coordinated across regional facilities."
    ],
    key_takeaways: [
      "Emergency patch cadence must be verified continuously",
      "Audit scheduled task logs for stealth persistence anomalies",
      "Immediate inter-agency reporting maintains collective posture"
    ],
    call_to_action: "Audit your firmware patch posture today. Resilience is not optional.",
    hashtags: ["#CyberSecurity", "#GridResilience", "#CriticalInfrastructure", "#NTRO"],
    cited_chunk_ids: ["doc_01_chunk_01", "doc_01_chunk_02"]
  },
  twitter: {
    thread_title: "Incident Brief: Substation Control Firmware Intrusion",
    total_tweets: 3,
    tweets: [
      {
        tweet_number: 1,
        content: "1/3 🚨 THREAT ADVISORY: Unauthorized access attempts detected against substation control software across 2 grid facilities via unpatched firmware vulnerability. Endpoints isolated. [Ref: Page 1]",
        character_count: 187,
        contains_media_placeholder: false
      },
      {
        tweet_number: 2,
        content: "2/3 Remediation update: Emergency firmware patches applied to all affected substations. Zero cascading impacts detected. Directorate confirms isolation complete. [Ref: Page 3]",
        character_count: 177,
        contains_media_placeholder: false
      },
      {
        tweet_number: 3,
        content: "3/3 Recommendations for operators: (1) Audit scheduled task execution logs immediately. (2) Restrict firmware modification access to air-gapped engineering bastions.",
        character_count: 172,
        contains_media_placeholder: false
      }
    ],
    cited_chunk_ids: ["doc_01_chunk_01", "doc_01_chunk_02"]
  },
  presentation: {
    deck_title: "Substation Firmware Intrusion: Technical Briefing & Remediation",
    target_audience: "Executive Leadership & Grid Operations Command",
    slides: [
      {
        slide_number: 1,
        title: "Executive Overview: Operation GhostLatch Incident",
        bullet_points: [
          "Unauthorized access attempt detected at two grid substation facilities",
          "Exploitation vector: Unpatched legacy firmware vulnerability",
          "Remediation achieved with zero operational downtime or transmission disruptions"
        ],
        visual_guidance: "Split layout: Threat timeline on left, impact severity metrics on right.",
        speaker_notes: "Briefing for command staff. Emphasize that rapid containment prevented cross-grid contagion.",
        slide_reference_citations: ["doc_01_chunk_01"]
      },
      {
        slide_number: 2,
        title: "Forensic Findings & Corrective Posture",
        bullet_points: [
          "Root cause localized to substation control software interface",
          "Directorate of Power Grid Resilience issued emergency compliance directives",
          "Scheduled log telemetry audits mandated across all transmission nodes"
        ],
        visual_guidance: "Three-column architecture card with severity indicators.",
        speaker_notes: "Highlight the coordination between local detection and national compliance guidelines.",
        slide_reference_citations: ["doc_01_chunk_02"]
      }
    ]
  },
  video: {
    video_title: "Tactical Response: Substation Vulnerability Remediation",
    target_duration: "60 Seconds",
    logline: "How emergency isolation and patch orchestration thwarted a critical infrastructure intrusion.",
    scenes: [
      {
        scene_number: 1,
        duration_seconds: 15,
        visual_description: "Dark tactical control room display showing blinking red indicators on 2 substation icons.",
        narration_voiceover: "At 03 September 2026, automated sensors flagged unauthorized attempts on substation control firmware.",
        on_screen_subtitles: "INCIDENT DETECTED: 2 SUBSTATION ENDPOINTS",
        music_sound_cues: "Low pulsating electronic rhythm with alert hum."
      },
      {
        scene_number: 2,
        duration_seconds: 25,
        visual_description: "Transition to green status indicators as emergency patch script completes.",
        narration_voiceover: "Within hours, emergency patches restored operational integrity with zero downtime.",
        on_screen_subtitles: "REMEDIATION COMPLETE: ZERO GRID FAILURE",
        music_sound_cues: "Tension resolves into crisp, authoritative synth tone."
      }
    ],
    cited_chunk_ids: ["doc_01_chunk_01"]
  },
  infographic: {
    infographic_title: "Incident Profile: Substation Control Software Breach",
    central_theme: "Rapid Containment in Critical Infrastructure Defense",
    sections: [
      {
        section_order: 1,
        header: "Detection & Exposure",
        key_statistic_or_callout: "2 Endpoints",
        descriptive_copy: "Firmware vulnerability exploited; isolated before lateral movement.",
        recommended_chart_type: "Metric Card"
      },
      {
        section_order: 2,
        header: "Remediation Velocity",
        key_statistic_or_callout: "100% Patched",
        descriptive_copy: "All affected substations remediated with zero transmission loss.",
        recommended_chart_type: "Bar Chart"
      }
    ],
    cited_chunk_ids: ["doc_01_chunk_01", "doc_01_chunk_02"]
  }
};

export const FLAGSHIP_MOCK_DISCREPANCY: EntityDiscrepancy = {
  draft_entity: "Directorate of Grid Power Resilience",
  suggested_source_entity: "Directorate of Power Grid Resilience",
  similarity_score: 98.2,
  status: "FLAGGED_MISMATCH",
  deliverable_name: "Intelligence Advisory",
  section_title: "Compliance & Governance Protocol",
  source_excerpt: "The Directorate of Power Grid Resilience confirmed that all affected substations have since been remediated with emergency firmware patches.",
  page_number: 3
};

// State storage for fallback demo
let mockJobState: {
  jobId: string;
  parameters?: GlobalParams;
  requestedFormats: string[];
  status: StatusResponse['status'];
  hardGateTriggered: boolean;
  humanApproved: boolean;
  draftOutputs: Record<string, any>;
  sourceChunks: SourceChunk[];
} = {
  jobId: "demo-job-2026-09",
  requestedFormats: ["advisory", "exec_summary", "linkedin"],
  status: "idle",
  hardGateTriggered: false,
  humanApproved: false,
  draftOutputs: { ...MOCK_DRAFT_OUTPUTS },
  sourceChunks: [...MOCK_SOURCE_CHUNKS]
};

// 1. POST /api/ingest
export async function ingestFiles(
  files: { file: File; role: 'PRIMARY' | 'SUPPORTING' }[]
): Promise<IngestResponse> {
  const formData = new FormData();
  files.forEach((item, index) => {
    formData.append(`file_${index}`, item.file);
    formData.append(`role_${index}`, item.role);
  });

  try {
    const res = await fetch(`${API_BASE_URL}/api/ingest`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fixture ingestion response:", err);
    mockJobState.jobId = `job-${Date.now().toString(36)}`;
    mockJobState.status = "idle";
    return {
      job_id: mockJobState.jobId,
      source_chunks: MOCK_SOURCE_CHUNKS
    };
  }
}

// 2. POST /api/generate
export async function generateDeliverables(
  jobId: string,
  parameters: GlobalParams,
  requestedFormats: string[]
): Promise<GenerateResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: jobId,
        parameters,
        requested_formats: requestedFormats,
      }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using fixture generate response:", err);
    mockJobState.jobId = jobId;
    mockJobState.parameters = parameters;
    mockJobState.requestedFormats = requestedFormats;
    mockJobState.status = "evaluating_gate";
    mockJobState.hardGateTriggered = true; // Trigger the key demo climax moment!
    return {
      job_id: jobId,
      status: "in_progress"
    };
  }
}

// 3. GET /api/status/{job_id}
export async function getStatus(jobId: string): Promise<StatusResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/status/${jobId}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    // Offline / Mock status progression for smooth demo
    if (mockJobState.hardGateTriggered && !mockJobState.humanApproved) {
      return {
        status: "hard_gate_halted",
        hard_gate_triggered: true,
        entity_discrepancies: [FLAGSHIP_MOCK_DISCREPANCY],
        draft_outputs: mockJobState.draftOutputs,
        source_chunks: mockJobState.sourceChunks
      };
    }

    return {
      status: mockJobState.humanApproved ? "completed" : "idle",
      hard_gate_triggered: false,
      entity_discrepancies: [],
      draft_outputs: mockJobState.draftOutputs,
      source_chunks: mockJobState.sourceChunks
    };
  }
}

// 4. POST /api/review/confirm
export async function confirmReview(payload: ReviewConfirmPayload): Promise<ReviewConfirmResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/review/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, simulating review confirmation:", err);
    mockJobState.humanApproved = payload.human_approved;
    mockJobState.hardGateTriggered = false;
    mockJobState.status = "completed";

    // If human applied correction, update the draft in memory
    if (payload.human_corrections && payload.human_corrections["advisory"]) {
      mockJobState.draftOutputs.advisory.compliance_and_governance = 
        payload.human_corrections["advisory"].compliance_and_governance || 
        mockJobState.draftOutputs.advisory.compliance_and_governance;
    }

    return { status: "resumed_and_completed" };
  }
}

// 5. GET /api/export/{format}/{job_id}
export function getExportUrl(format: string, jobId: string): string {
  return `${API_BASE_URL}/api/export/${format}/${jobId}`;
}
