import React, { useState } from 'react';
import { 
  Form, 
  Select, 
  Button, 
  message, 
  Card, 
  Spin,
  Typography,
  Space,
  Alert,
  Input
} from 'antd';
import { CodeOutlined, SendOutlined } from '@ant-design/icons';
import { 
  submissionService, 
  ProgrammingLanguage, 
  CreateSubmissionDto,
  Submission 
} from '../../service/submissionService';

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;

interface SubmissionFormProps {
  problemId: string;
  problemTitle: string;
  onSubmissionCreated?: (submission: Submission) => void;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({
  problemId,
  problemTitle,
  onSubmissionCreated
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>();

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const submissionData: CreateSubmissionDto = {
        problem: problemId,
        language: values.language,
        code: values.code
      };
      
      const submission = await submissionService.submitSolution(submissionData);
      
      message.success('Solution submitted successfully!');
      form.resetFields();
      
      if (onSubmissionCreated) {
        onSubmissionCreated(submission);
      }
      
    } catch (error: any) {
      message.error(error.message || 'Failed to submit solution');
    } finally {
      setLoading(false);
    }
  };

  const getCodePlaceholder = (language?: ProgrammingLanguage): string => {
    switch (language) {
      case ProgrammingLanguage.CPP:
        return `#include <iostream>
#include <vector>
using namespace std;

int main() {
    // Your solution here
    return 0;
}`;
      
      case ProgrammingLanguage.JAVA:
        return `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your solution here
    }
}`;
      
      case ProgrammingLanguage.PYTHON:
        return `# Your solution here
def solve():
    pass

if __name__ == "__main__":
    solve()`;
      
      case ProgrammingLanguage.JAVASCRIPT:
        return `// Your solution here
function solve() {
    
}

solve();`;
      
      case ProgrammingLanguage.C:
        return `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Your solution here
    return 0;
}`;
      
      default:
        return 'Write your solution here...';
    }
  };

  return (
    <Card
      title={
        <Space>
          <CodeOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Submit Solution
          </Title>
        </Space>
      }
      className="submission-form-card"
    >
      <Alert
        message={`Submitting for: ${problemTitle}`}
        type="info"
        style={{ marginBottom: 16 }}
        showIcon
      />
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          language: ProgrammingLanguage.CPP
        }}
      >
        <Form.Item
          name="language"
          label="Programming Language"
          rules={[{ required: true, message: 'Please select a programming language' }]}
        >
          <Select
            placeholder="Select programming language"
            onChange={(value) => setSelectedLanguage(value)}
            size="large"
          >
            <Option value={ProgrammingLanguage.CPP}>
              {submissionService.getLanguageDisplayName(ProgrammingLanguage.CPP)}
            </Option>
            <Option value={ProgrammingLanguage.JAVA}>
              {submissionService.getLanguageDisplayName(ProgrammingLanguage.JAVA)}
            </Option>
            <Option value={ProgrammingLanguage.PYTHON}>
              {submissionService.getLanguageDisplayName(ProgrammingLanguage.PYTHON)}
            </Option>
            <Option value={ProgrammingLanguage.JAVASCRIPT}>
              {submissionService.getLanguageDisplayName(ProgrammingLanguage.JAVASCRIPT)}
            </Option>
            <Option value={ProgrammingLanguage.C}>
              {submissionService.getLanguageDisplayName(ProgrammingLanguage.C)}
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="code"
          label="Source Code"
          rules={[
            { required: true, message: 'Please enter your source code' },
            { min: 10, message: 'Code must be at least 10 characters long' }
          ]}
        >
          <TextArea
            placeholder={getCodePlaceholder(selectedLanguage)}
            rows={20}
            style={{ 
              fontFamily: 'monospace',
              fontSize: '14px'
            }}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            icon={<SendOutlined />}
            block
          >
            {loading ? 'Submitting...' : 'Submit Solution'}
          </Button>
        </Form.Item>
      </Form>
      
      <div style={{ marginTop: 16 }}>
        <Text type="secondary">
          <strong>Note:</strong> Your submission will be evaluated against the test cases. 
          Make sure your solution handles all edge cases correctly.
        </Text>
      </div>
    </Card>
  );
};

export default SubmissionForm;