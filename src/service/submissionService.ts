const API_BASE = 'http://localhost:3000';

export enum SubmissionVerdict {
  PENDING = 'pending',
  ACCEPTED = 'accepted', 
  WRONG_ANSWER = 'wrong_answer',
  TIME_LIMIT_EXCEEDED = 'time_limit_exceeded',
  MEMORY_LIMIT_EXCEEDED = 'memory_limit_exceeded',
  RUNTIME_ERROR = 'runtime_error',
  COMPILATION_ERROR = 'compilation_error',
  SYSTEM_ERROR = 'system_error'
}

export enum ProgrammingLanguage {
  CPP = 'cpp',
  JAVA = 'java',
  PYTHON = 'python',
  JAVASCRIPT = 'javascript',
  C = 'c'
}

export interface Submission {
  _id: string;
  user: {
    _id: string;
    handle: string;
  };
  problem: {
    _id: string;
    code: string;
    title: string;
  };
  language: ProgrammingLanguage;
  verdict: SubmissionVerdict;
  timeUsedMs: number;
  memoryUsedKb: number;
  code: string;
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

export interface UserStats {
  totalSubmissions: number;
  verdictBreakdown: Array<{
    _id: SubmissionVerdict;
    count: number;
  }>;
}

class SubmissionService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private buildQueryString(params: SubmissionQueryParams): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    
    return searchParams.toString();
  }

  async submitSolution(submission: CreateSubmissionDto): Promise<Submission> {
    const response = await fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
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
    const queryString = this.buildQueryString(params);
    const url = `${API_BASE}/submissions${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
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
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch submission');
    }
    
    return response.json();
  }

  async getSubmissionsByProblem(problemId: string): Promise<Submission[]> {
    const response = await fetch(`${API_BASE}/submissions/problem/${problemId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
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
      headers: this.getAuthHeaders(),
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
      headers: this.getAuthHeaders(),
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
    totalTestCases?: number
  ): Promise<Submission> {
    const response = await fetch(`${API_BASE}/submissions/${id}/verdict`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
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
        return 'blue';
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
        return 'Pending';
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