import { API_BASE, buildAuthHeaders } from './api';

export enum SubmissionVerdict {
  PENDING = 'pending',
  JUDGING = 'judging',
  ACCEPTED = 'accepted',
  WRONG_ANSWER = 'wrong_answer',
  TIME_LIMIT_EXCEEDED = 'time_limit_exceeded',
  MEMORY_LIMIT_EXCEEDED = 'memory_limit_exceeded',
  RUNTIME_ERROR = 'runtime_error',
  COMPILATION_ERROR = 'compilation_error',
  SYSTEM_ERROR = 'system_error',
}

// Verdicts that are still being computed by the judge (the UI polls these).
export const IN_PROGRESS_VERDICTS: ReadonlySet<SubmissionVerdict> = new Set([
  SubmissionVerdict.PENDING,
  SubmissionVerdict.JUDGING,
]);

export const isVerdictInProgress = (verdict: SubmissionVerdict): boolean =>
  IN_PROGRESS_VERDICTS.has(verdict);

export enum ProgrammingLanguage {
  CPP = 'cpp',
  JAVA = 'java',
  PYTHON = 'python',
  JAVASCRIPT = 'javascript',
  C = 'c',
}

export interface FileReference {
  bucket: string;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface Submission {
  _id: string;
  user: {
    _id: string;
    handle: string;
  };
  // Can be null when the referenced problem was deleted after this submission was made.
  problem: {
    _id: string;
    code: string;
    title: string;
  } | null;
  language: ProgrammingLanguage;
  verdict: SubmissionVerdict;
  timeUsedMs: number;
  memoryUsedKb: number;
  sourceFile: FileReference;
  errorMessage?: string;
  testCasesPassed: number;
  totalTestCases: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubmissionDto {
  problem: string;
  language: ProgrammingLanguage;
  code: string;
}

export interface SubmissionListResponse {
  items: Submission[];
  total: number;
  current: number;
  pageSize: number;
  totalPages: number;
}

export interface SubmissionQueryParams {
  current?: number;
  pageSize?: number;
  user?: string;
  problem?: string;
  language?: ProgrammingLanguage;
  verdict?: SubmissionVerdict;
}

const getAuthHeaders = () => buildAuthHeaders();

const buildQueryString = (params: SubmissionQueryParams): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  return searchParams.toString();
};

export const getVerdictColor = (verdict: SubmissionVerdict): string => {
  switch (verdict) {
    case SubmissionVerdict.ACCEPTED:
      return 'green';
    case SubmissionVerdict.WRONG_ANSWER:
      return 'red';
    case SubmissionVerdict.TIME_LIMIT_EXCEEDED:
      return 'orange';
    case SubmissionVerdict.MEMORY_LIMIT_EXCEEDED:
      return 'orange';
    case SubmissionVerdict.RUNTIME_ERROR:
      return 'red';
    case SubmissionVerdict.COMPILATION_ERROR:
      return 'red';
    case SubmissionVerdict.SYSTEM_ERROR:
      return 'red';
    case SubmissionVerdict.PENDING:
      return 'blue';
    default:
      return 'default';
  }
};

export const getVerdictText = (verdict: SubmissionVerdict): string => {
  switch (verdict) {
    case SubmissionVerdict.ACCEPTED:
      return 'Accepted';
    case SubmissionVerdict.WRONG_ANSWER:
      return 'Wrong Answer';
    case SubmissionVerdict.TIME_LIMIT_EXCEEDED:
      return 'Time Limit Exceeded';
    case SubmissionVerdict.MEMORY_LIMIT_EXCEEDED:
      return 'Memory Limit Exceeded';
    case SubmissionVerdict.RUNTIME_ERROR:
      return 'Runtime Error';
    case SubmissionVerdict.COMPILATION_ERROR:
      return 'Compilation Error';
    case SubmissionVerdict.SYSTEM_ERROR:
      return 'System Error';
    case SubmissionVerdict.PENDING:
      return 'Pending';
    default:
      return verdict;
  }
};

export const getLanguageDisplayName = (language: ProgrammingLanguage): string => {
  switch (language) {
    case ProgrammingLanguage.CPP:
      return 'C++';
    case ProgrammingLanguage.JAVA:
      return 'Java';
    case ProgrammingLanguage.PYTHON:
      return 'Python';
    case ProgrammingLanguage.JAVASCRIPT:
      return 'JavaScript';
    case ProgrammingLanguage.C:
      return 'C';
    default:
      return language;
  }
};

export interface UserStats {
  totalSubmissions: number;
  verdictBreakdown: Array<{
    _id: SubmissionVerdict;
    count: number;
  }>;
}

export interface RunResult {
  status:
    | 'ok'
    | 'compile_error'
    | 'runtime_error'
    | 'time_limit_exceeded'
    | 'memory_limit_exceeded'
    | 'internal_error';
  stdout: string;
  stderr: string;
  timeMs: number;
  memoryKb: number;
}

class SubmissionService {
  private readonly authHeaders = getAuthHeaders;

  private readonly queryString = buildQueryString;

  async runSolution(
    language: ProgrammingLanguage,
    code: string,
    stdin: string,
  ): Promise<RunResult> {
    const response = await fetch(`${API_BASE}/submissions/run`, {
      method: 'POST',
      headers: this.authHeaders(),
      credentials: 'include',
      body: JSON.stringify({ language, code, stdin }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to run solution: ${error}`);
    }

    return response.json();
  }

  async submitSolution(submission: CreateSubmissionDto): Promise<Submission> {
    const response = await fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: this.authHeaders(),
      credentials: 'include',
      body: JSON.stringify(submission),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to submit solution: ${error}`);
    }

    return response.json();
  }

  async getSubmissions(params: SubmissionQueryParams = {}): Promise<SubmissionListResponse> {
    const queryString = this.queryString(params);
    const url = `${API_BASE}/submissions${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.authHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch submissions');
    }

    return response.json();
  }

  async getSubmission(id: string): Promise<Submission> {
    const response = await fetch(`${API_BASE}/submissions/${id}`, {
      method: 'GET',
      headers: this.authHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch submission');
    }

    return response.json();
  }

  async getSubmissionSourceCode(id: string): Promise<string> {
    const response = await fetch(`${API_BASE}/submissions/${id}/source`, {
      method: 'GET',
      headers: this.authHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch submission source code');
    }

    const data = await response.json();
    return data.sourceCode;
  }

  async getSubmissionsByProblem(problemId: string): Promise<Submission[]> {
    const response = await fetch(`${API_BASE}/submissions/problem/${problemId}`, {
      method: 'GET',
      headers: this.authHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch submissions for problem');
    }

    return response.json();
  }

  async getSubmissionsByUser(userId: string): Promise<Submission[]> {
    const response = await fetch(`${API_BASE}/submissions/user/${userId}`, {
      method: 'GET',
      headers: this.authHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user submissions');
    }

    return response.json();
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const response = await fetch(`${API_BASE}/submissions/user/${userId}/stats`, {
      method: 'GET',
      headers: this.authHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user statistics');
    }

    return response.json();
  }

  async updateVerdict(
    id: string,
    verdict: SubmissionVerdict,
    timeUsedMs?: number,
    memoryUsedKb?: number,
    errorMessage?: string,
    testCasesPassed?: number,
    totalTestCases?: number,
  ): Promise<Submission> {
    const response = await fetch(`${API_BASE}/submissions/${id}/verdict`, {
      method: 'PUT',
      headers: this.authHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        verdict,
        timeUsedMs,
        memoryUsedKb,
        errorMessage,
        testCasesPassed,
        totalTestCases,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update submission verdict');
    }

    return response.json();
  }

  // Utility methods
  getVerdictColor(verdict: SubmissionVerdict): string {
    switch (verdict) {
      case SubmissionVerdict.ACCEPTED:
        return 'green';
      case SubmissionVerdict.WRONG_ANSWER:
        return 'red';
      case SubmissionVerdict.TIME_LIMIT_EXCEEDED:
        return 'orange';
      case SubmissionVerdict.MEMORY_LIMIT_EXCEEDED:
        return 'orange';
      case SubmissionVerdict.RUNTIME_ERROR:
        return 'red';
      case SubmissionVerdict.COMPILATION_ERROR:
        return 'red';
      case SubmissionVerdict.SYSTEM_ERROR:
        return 'red';
      case SubmissionVerdict.PENDING:
        return 'default';
      case SubmissionVerdict.JUDGING:
        return 'processing';
      default:
        return 'default';
    }
  }

  getVerdictText(verdict: SubmissionVerdict): string {
    switch (verdict) {
      case SubmissionVerdict.ACCEPTED:
        return 'Accepted';
      case SubmissionVerdict.WRONG_ANSWER:
        return 'Wrong Answer';
      case SubmissionVerdict.TIME_LIMIT_EXCEEDED:
        return 'Time Limit Exceeded';
      case SubmissionVerdict.MEMORY_LIMIT_EXCEEDED:
        return 'Memory Limit Exceeded';
      case SubmissionVerdict.RUNTIME_ERROR:
        return 'Runtime Error';
      case SubmissionVerdict.COMPILATION_ERROR:
        return 'Compilation Error';
      case SubmissionVerdict.SYSTEM_ERROR:
        return 'System Error';
      case SubmissionVerdict.PENDING:
        return 'In Queue';
      case SubmissionVerdict.JUDGING:
        return 'Judging…';
      default:
        return verdict;
    }
  }

  getLanguageDisplayName(language: ProgrammingLanguage): string {
    switch (language) {
      case ProgrammingLanguage.CPP:
        return 'C++';
      case ProgrammingLanguage.JAVA:
        return 'Java';
      case ProgrammingLanguage.PYTHON:
        return 'Python';
      case ProgrammingLanguage.JAVASCRIPT:
        return 'JavaScript';
      case ProgrammingLanguage.C:
        return 'C';
      default:
        return language;
    }
  }
}

export const submissionService = new SubmissionService();
