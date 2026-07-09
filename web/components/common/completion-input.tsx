import { ChatContext } from '@/app/chat-context';
import { apiInterceptors, getDocumentList } from '@/client/api';
import { IDocument } from '@/types/knowledge';
import { LoadingOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, Tooltip } from 'antd';
import { PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';
import DocList from '../chat/doc-list';
import DocUpload from '../chat/doc-upload';
import PromptBot from './prompt-bot';

type TextAreaProps = Omit<Parameters<typeof Input.TextArea>[0], 'value' | 'onPressEnter' | 'onChange' | 'onSubmit'>;

interface Props {
  onSubmit: (val: string) => void;
  handleFinish?: (val: boolean) => void;
  loading?: boolean;
  /** Akış sürerken çağrılır; verilirse buton "durdur"a döner ve tıklayınca sorguyu iptal eder. */
  onCancel?: () => void;
  placeholder?: string;
}

function CompletionInput({
  children,
  loading,
  onSubmit,
  handleFinish,
  onCancel,
  placeholder,
  ...props
}: PropsWithChildren<Props & TextAreaProps>) {
  const { dbParam, scene } = useContext(ChatContext);

  const [userInput, setUserInput] = useState('');
  const showUpload = useMemo(() => scene === 'chat_knowledge', [scene]);
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const uploadCountRef = useRef(0);

  useEffect(() => {
    showUpload && fetchDocuments();
  }, [dbParam]);

  async function fetchDocuments() {
    if (!dbParam) {
      return null;
    }
    const [_, data] = await apiInterceptors(
      getDocumentList(dbParam, {
        page: 1,
        page_size: uploadCountRef.current,
      }),
    );
    setDocuments(data?.data || []);
  }

  const onUploadFinish = async () => {
    uploadCountRef.current += 1;
    await fetchDocuments();
  };

  return (
    <div className='flex-1 relative'>
      <DocList documents={documents} dbParam={dbParam} />
      {showUpload && (
        <DocUpload handleFinish={handleFinish} onUploadFinish={onUploadFinish} className='absolute z-10 top-2 left-2' />
      )}
      <Input.TextArea
        className={`flex-1 ${showUpload ? 'pl-10' : ''} pr-10`}
        size='large'
        value={userInput}
        autoSize={{ minRows: 1, maxRows: 4 }}
        {...props}
        onPressEnter={e => {
          if (!userInput.trim()) return;
          if (e.keyCode === 13) {
            if (e.shiftKey) {
              e.preventDefault();
              setUserInput(state => state + '\n');
              return;
            }
            onSubmit(userInput);
            setTimeout(() => {
              setUserInput('');
            }, 0);
          }
        }}
        onChange={e => {
          if (typeof props.maxLength === 'number') {
            setUserInput(e.target.value.substring(0, props.maxLength));
            return;
          }
          setUserInput(e.target.value);
        }}
        placeholder={placeholder}
      />
      {loading && onCancel ? (
        <Tooltip title='Durdur'>
          <Button
            className='ml-2 flex items-center justify-center absolute right-0 bottom-0'
            size='large'
            type='text'
            onClick={onCancel}
            icon={
              <span className='relative inline-flex items-center justify-center' style={{ width: 22, height: 22 }}>
                <LoadingOutlined spin style={{ fontSize: 22, color: '#1677ff', position: 'absolute' }} />
                <span style={{ width: 9, height: 9, background: '#ef4444', borderRadius: 2 }} />
              </span>
            }
          />
        </Tooltip>
      ) : (
        <Button
          className='ml-2 flex items-center justify-center absolute right-0 bottom-0'
          size='large'
          type='text'
          loading={loading}
          icon={<SendOutlined />}
          onClick={() => {
            onSubmit(userInput);
          }}
        />
      )}
      <PromptBot
        submit={prompt => {
          setUserInput(userInput + prompt);
        }}
      />
      {children}
    </div>
  );
}

export default CompletionInput;
