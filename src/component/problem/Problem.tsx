import React, { useState } from "react";
import { Layout, Card, Divider, Typography, Tag, Button, Select, Input, Tabs } from "antd";
import { CodeOutlined, PlayCircleOutlined, CloudUploadOutlined } from "@ant-design/icons";
import Editor from "@monaco-editor/react";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

interface IProblem {
  problemDescription: string;
  tags: string[];
  title: string;
}

const Problem = ({ problemDescription, tags, title }: IProblem) => {
  const [language, setLanguage] = useState("C++20");
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [stdout, setStdout] = useState("");
  const [running, setRunning] = useState(false);

  function fakeRun() {
    setRunning(true);
    setStdout("");
    setTimeout(() => {
      setStdout("(demo) Code executed successfully.\n");
      setRunning(false);
    }, 700);
  }

  return (
    <Layout style={{ height: "100%" }}>
      <Content style={{ padding: 12 }}>
        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>{title}</Title>
          {tags.map((tag, index) => (
            <Tag key={index} color="blue">
              {tag}
            </Tag>
          ))}
          <Divider />
          <Paragraph>{problemDescription}</Paragraph>
        </Card>

        <Card
          title={<span><CodeOutlined /> Editor</span>}
          extra={
            <>
              <Select
                value={language}
                style={{ width: 140, marginRight: 8 }}
                onChange={setLanguage}
                options={[
                  { value: "C++20", label: "C++20" },
                  { value: "Python 3", label: "Python 3" },
                  { value: "Java", label: "Java" },
                  { value: "JavaScript", label: "JavaScript" },
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
            language={language.toLowerCase()}
            value={code}
            onChange={(v) => setCode(v || "")}
            options={{ fontSize: 14, minimap: { enabled: false } }}
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
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Output" key="output">
              <pre>{stdout || "(run the code to see output)"}</pre>
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </Content>
    </Layout>
  );
};

export default Problem;