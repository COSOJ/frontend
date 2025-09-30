import React, { useState, useEffect, startTransition } from "react";
import { Layout, Card, Divider, Typography, Tag, Button, Select, Input, Tabs, Spin, message } from "antd";
import { CodeOutlined, PlayCircleOutlined, CloudUploadOutlined, ClockCircleOutlined, DatabaseOutlined, SendOutlined, HistoryOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Problem as ProblemType, problemService } from "../../service/problemService";
import { useAuth } from "../../context/AuthContext";
import LazySubmissionForm from "../submission/LazySubmissionForm";
import LazySubmissionList from "../submission/LazySubmissionList";
import { ProgrammingLanguage, CreateSubmissionDto, submissionService } from "../../service/submissionService";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const Problem = () => {
  const [problem, setProblem] = useState<ProblemType | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<ProgrammingLanguage>(ProgrammingLanguage.CPP);
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [stdout, setStdout] = useState("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("problem");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (id) {
      loadProblem(id);
    }
  }, [id]);

  const loadProblem = async (problemId: string) => {
    setLoading(true);
    try {
      const problemData = await problemService.getProblem(problemId);
      setProblem(problemData);
      
      // Set sample input if available
      if (problemData.cases && problemData.cases.length > 0) {
        setStdin(problemData.cases[0].input || '');
      }

      // Set default code template based on language
      setCodeTemplate(language);
    } catch (error) {
      message.error('Failed to load problem');
      startTransition(() => {
        navigate('/problems');
      });
    } finally {
      setLoading(false);
    }
  };

  const setCodeTemplate = (selectedLanguage: ProgrammingLanguage) => {
    const templates = {
      [ProgrammingLanguage.CPP]: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    // Your solution here
    return 0;
}`,
      [ProgrammingLanguage.JAVA]: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your solution here
    }
}`,
      [ProgrammingLanguage.PYTHON]: `# Your solution here
def solve():
    pass

if __name__ == "__main__":
    solve()`,
      [ProgrammingLanguage.JAVASCRIPT]: `// Your solution here
function solve() {
    
}

solve();`,
      [ProgrammingLanguage.C]: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Your solution here
    return 0;
}`
    };
    
    setCode(templates[selectedLanguage] || '');
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'green';
    if (difficulty <= 6) return 'orange';
    return 'red';
  };

  const getDifficultyText = (difficulty: number) => {
    if (difficulty <= 3) return 'Easy';
    if (difficulty <= 6) return 'Medium';
    return 'Hard';
  };

  function fakeRun() {
    setRunning(true);
    setStdout("");
    setTimeout(() => {
      setStdout("(demo) Code executed successfully.\nOutput: Hello World!\n");
      setRunning(false);
    }, 700);
  }

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      message.warning('Please login to submit solutions');
      return;
    }

    if (!code.trim()) {
      message.warning('Please write some code before submitting');
      return;
    }

    if (!problem) {
      message.error('Problem not found');
      return;
    }

    try {
      setSubmitting(true);
      
      const submissionData: CreateSubmissionDto = {
        problem: problem._id,
        language: language,
        code: code
      };
      
      await submissionService.submitSolution(submissionData);
      message.success('Solution submitted successfully!');
      
      // Switch to submissions tab to show the new submission
      setActiveTab('submissions');
      
    } catch (error: any) {
      message.error(error.message || 'Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLanguageChange = (newLanguage: ProgrammingLanguage) => {
    setLanguage(newLanguage);
    setCodeTemplate(newLanguage);
  };

  const getMonacoLanguage = (lang: ProgrammingLanguage): string => {
    switch (lang) {
      case ProgrammingLanguage.CPP:
      case ProgrammingLanguage.C:
        return 'cpp';
      case ProgrammingLanguage.JAVA:
        return 'java';
      case ProgrammingLanguage.PYTHON:
        return 'python';
      case ProgrammingLanguage.JAVASCRIPT:
        return 'javascript';
      default:
        return 'plaintext';
    }
  };

  if (loading) {
    return (
      <Layout style={{ height: "100vh" }}>
        <Content style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!problem) {
    return (
      <Layout style={{ height: "100vh" }}>
        <Content style={{ padding: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={3}>Problem not found</Title>
            <Button type="primary" onClick={() => {
              startTransition(() => {
                navigate('/problems');
              });
            }}>
              Back to Problems
            </Button>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ height: "100%" }}>
      <Content style={{ padding: 12 }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'problem',
              label: (
                <span>
                  <CodeOutlined />
                  Problem
                </span>
              ),
              children: (
                <>
                  <Card style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                      <div>
                        <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                          {problem.code}. {problem.title}
                        </Title>
                        <div style={{ marginBottom: 8 }}>
                          <Tag color={getDifficultyColor(problem.difficulty)}>
                            {getDifficultyText(problem.difficulty)}
                          </Tag>
                          {problem.tags.map((tag) => (
                            <Tag key={tag} color="blue">
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: '12px', color: '#666' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ClockCircleOutlined />
                          <span>{problem.timeLimitMs}ms</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <DatabaseOutlined />
                          <span>{problem.memoryLimitMb}MB</span>
                        </div>
                      </div>
                    </div>
                    
                    <Divider />
                    
                    <div style={{ marginBottom: 24 }}>
                      <Title level={5}>Problem Statement</Title>
                      <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                        {problem.statement}
                      </Typography.Paragraph>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <Title level={5}>Input</Title>
                      <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                        {problem.inputSpec}
                      </Typography.Paragraph>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <Title level={5}>Output</Title>
                      <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                        {problem.outputSpec}
                      </Typography.Paragraph>
                    </div>

                    {problem.cases && problem.cases.length > 0 && (
                      <div>
                        <Title level={5}>Sample Test Cases</Title>
                        {problem.cases.map((testCase, index) => (
                          <div key={index} style={{ marginBottom: 16 }}>
                            <Typography.Text strong>Sample {index + 1}</Typography.Text>
                            {!testCase.isPublic && (
                              <Tag color="orange" style={{ marginLeft: 8 }}>Hidden</Tag>
                            )}
                            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                              <div style={{ flex: 1 }}>
                                <Typography.Text type="secondary">Input:</Typography.Text>
                                <div style={{ 
                                  background: '#f5f5f5', 
                                  padding: 8, 
                                  borderRadius: 4, 
                                  fontFamily: 'monospace',
                                  whiteSpace: 'pre-wrap'
                                }}>
                                  {testCase.input}
                                </div>
                              </div>
                              <div style={{ flex: 1 }}>
                                <Typography.Text type="secondary">Output:</Typography.Text>
                                <div style={{ 
                                  background: '#f5f5f5', 
                                  padding: 8, 
                                  borderRadius: 4, 
                                  fontFamily: 'monospace',
                                  whiteSpace: 'pre-wrap'
                                }}>
                                  {testCase.output}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  <Card
                    title={<span><CodeOutlined /> Solution</span>}
                    extra={
                      <>
                        <Select
                          value={language}
                          style={{ width: 140, marginRight: 8 }}
                          onChange={handleLanguageChange}
                          options={[
                            { value: ProgrammingLanguage.CPP, label: "C++" },
                            { value: ProgrammingLanguage.PYTHON, label: "Python" },
                            { value: ProgrammingLanguage.JAVA, label: "Java" },
                            { value: ProgrammingLanguage.JAVASCRIPT, label: "JavaScript" },
                            { value: ProgrammingLanguage.C, label: "C" },
                          ]}
                        />
                        <Button 
                          icon={<PlayCircleOutlined />} 
                          onClick={fakeRun} 
                          loading={running} 
                          style={{ marginRight: 8 }}
                        >
                          Run
                        </Button>
                        <Button 
                          type="primary" 
                          icon={<SendOutlined />}
                          onClick={handleSubmit}
                          loading={submitting}
                          disabled={!isAuthenticated}
                        >
                          Submit
                        </Button>
                      </>
                    }
                  >
                    <Editor
                      height="300px"
                      language={getMonacoLanguage(language)}
                      value={code}
                      onChange={(v) => setCode(v || "")}
                      options={{ 
                        fontSize: 14, 
                        minimap: { enabled: false },
                        theme: 'vs-dark'
                      }}
                    />
                  </Card>

                  <Card style={{ marginTop: 16 }}>
                    <Tabs defaultActiveKey="input">
                      <Tabs.TabPane tab="Custom Input" key="input">
                        <Input.TextArea
                          value={stdin}
                          onChange={(e) => setStdin(e.target.value)}
                          rows={5}
                          placeholder="Enter custom input"
                          style={{ fontFamily: 'monospace' }}
                        />
                      </Tabs.TabPane>
                      <Tabs.TabPane tab="Output" key="output">
                        <pre style={{ 
                          margin: 0, 
                          minHeight: 120, 
                          background: '#f5f5f5', 
                          padding: 12, 
                          borderRadius: 4 
                        }}>
                          {stdout || "(run the code to see output)"}
                        </pre>
                      </Tabs.TabPane>
                    </Tabs>
                  </Card>
                </>
              )
            },
            {
              key: 'submissions',
              label: (
                <span>
                  <HistoryOutlined />
                  Submissions
                </span>
              ),
              children: problem ? (
                <LazySubmissionList 
                  problemId={problem._id}
                  showProblemColumn={false}
                />
              ) : null
            },
            ...(isAuthenticated ? [{
              key: 'submit',
              label: (
                <span>
                  <SendOutlined />
                  Submit Solution
                </span>
              ),
              children: problem ? (
                <LazySubmissionForm 
                  problemId={problem._id}
                  problemTitle={problem.title}
                  onSubmissionCreated={() => {
                    setActiveTab('submissions');
                  }}
                />
              ) : null
            }] : [])
          ]}
        />
      </Content>
    </Layout>
  );
};

export default Problem;