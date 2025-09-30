import React, { useState, useEffect, startTransition } from "react";
import { Layout, Card, Divider, Typography, Tag, Button, Select, Input, Tabs, Spin, message } from "antd";
import { CodeOutlined, PlayCircleOutlined, CloudUploadOutlined, ClockCircleOutlined, DatabaseOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Problem as ProblemType, problemService } from "../../service/problemService";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const Problem = () => {
  const [problem, setProblem] = useState<ProblemType | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [stdout, setStdout] = useState("");
  const [running, setRunning] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
      if (problemData.samples && problemData.samples.length > 0) {
        setStdin(problemData.samples[0].input || '');
      }
    } catch (error) {
      message.error('Failed to load problem');
      startTransition(() => {
        navigate('/problems');
      });
    } finally {
      setLoading(false);
    }
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
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
              {problem.statement}
            </Paragraph>
          </div>

          <div style={{ marginBottom: 24 }}>
            <Title level={5}>Input</Title>
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
              {problem.inputSpec}
            </Paragraph>
          </div>

          <div style={{ marginBottom: 24 }}>
            <Title level={5}>Output</Title>
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
              {problem.outputSpec}
            </Paragraph>
          </div>

          {problem.samples && problem.samples.length > 0 && (
            <div>
              <Title level={5}>Sample Test Cases</Title>
              {problem.samples.map((sample, index) => (
                <div key={index} style={{ marginBottom: 16 }}>
                  <Text strong>Sample {index + 1}</Text>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                    <div style={{ flex: 1 }}>
                      <Text type="secondary">Input:</Text>
                      <div style={{ 
                        background: '#f5f5f5', 
                        padding: 8, 
                        borderRadius: 4, 
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {sample.input}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text type="secondary">Output:</Text>
                      <div style={{ 
                        background: '#f5f5f5', 
                        padding: 8, 
                        borderRadius: 4, 
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {sample.output}
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
                onChange={setLanguage}
                options={[
                  { value: "cpp", label: "C++" },
                  { value: "python", label: "Python" },
                  { value: "java", label: "Java" },
                  { value: "javascript", label: "JavaScript" },
                ]}
              />
              <Button icon={<PlayCircleOutlined />} onClick={fakeRun} loading={running} style={{ marginRight: 8 }}>
                Run
              </Button>
              <Button type="primary" icon={<CloudUploadOutlined />}>
                Submit
              </Button>
            </>
          }
        >
          <Editor
            height="300px"
            language={language}
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
      </Content>
    </Layout>
  );
};

export default Problem;