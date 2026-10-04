import { API_BASE, buildAuthHeaders } from './api';

const getAuthHeaders = () => buildAuthHeaders();

export interface TestCase {
  input: string;
  output: string;
  isPublic: boolean;
}

export interface Problem {
  _id: string;
  code: string;
  title: string;
  statement: string;
  difficulty: number;
  timeLimitMs: number;
  memoryLimitMb: number;
  inputSpec: string;
  outputSpec: string;
  cases: TestCase[];
  tags: string[];
  visibility: 'public' | 'private';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProblemDto {
  code: string;
  title: string;
  statement: string;
  difficulty: number;
  timeLimitMs: number;
  memoryLimitMb: number;
  inputSpec: string;
  outputSpec: string;
  cases: TestCase[];
  tags: string[];
  visibility?: 'public' | 'private';
}

export interface ProblemListResponse {
  items: Problem[];
  total: number;
  current: number;
  pageSize: number;
  totalPages: number;
}

class ProblemService {
  private readonly authHeaders = getAuthHeaders;

  async getProblems(current: number = 1, pageSize: number = 10): Promise<ProblemListResponse> {
    const response = await fetch(
      `${API_BASE}/problems?current=${current}&pageSize=${pageSize}`,
      {
        method: 'GET',
        headers: this.authHeaders(),
        credentials: 'include',
      },
    );
    if (!response.ok) {
      throw new Error('Failed to fetch problems');
    }
    return response.json();
  }

  async getProblem(id: string): Promise<Problem> {
    const response = await fetch(`${API_BASE}/problems/${id}`, {
      method: 'GET',
      headers: this.authHeaders(),
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch problem');
    }
    return response.json();
  }

  async createProblem(problem: CreateProblemDto): Promise<Problem> {
    const response = await fetch(`${API_BASE}/problems`, {
      method: 'POST',
      headers: this.authHeaders(),
      credentials: 'include',
      body: JSON.stringify(problem),
    });
    if (!response.ok) {
      throw new Error('Failed to create problem');
    }
    return response.json();
  }

  async updateProblem(id: string, problem: CreateProblemDto): Promise<Problem> {
    const response = await fetch(`${API_BASE}/problems/${id}`, {
      method: 'PUT',
      headers: this.authHeaders(),
      credentials: 'include',
      body: JSON.stringify(problem),
    });
    if (!response.ok) {
      throw new Error('Failed to update problem');
    }
    return response.json();
  }

  async deleteProblem(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/problems/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders(),
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to delete problem');
    }
  }
}

export const problemService = new ProblemService();
