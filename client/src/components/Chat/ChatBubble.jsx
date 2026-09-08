import { formatTime } from '../../utils/formatters';

const TickIcon = ({ status }) => {
  if (status === 'sent') {
    return (
      <span className="tick-icon sent">
        <svg viewBox="0 0 16 11" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.659.003.423.423 0 0 0 .003.64l2.358 2.46a.465.465 0 0 0 .348.153.465.465 0 0 0 .357-.168l6.535-8.064a.424.424 0 0 0-.056-.641z" fill="currentColor" />
        </svg>
      </span>
    );
  }

  // Double tick for delivered/seen
  return (
    <span className={`tick-icon ${status}`}>
      <svg viewBox="0 0 16 11" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.659.003.423.423 0 0 0 .003.64l2.358 2.46a.465.465 0 0 0 .348.153.465.465 0 0 0 .357-.168l6.535-8.064a.424.424 0 0 0-.056-.641z" fill="currentColor" />
        <path d="M15.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-.88-.917a.463.463 0 0 0-.66.003.423.423 0 0 0 .004.64l1.208 1.26a.465.465 0 0 0 .348.153.465.465 0 0 0 .357-.168l6.535-8.064a.424.424 0 0 0-.037-.62z" fill="currentColor" />
      </svg>
    </span>
  );
};

const ChatBubble = ({ message, isOwn }) => {
  return (
    <div className={`message-wrapper ${isOwn ? 'outgoing' : 'incoming'}`}>
      <div className={`message-bubble ${isOwn ? 'outgoing' : 'incoming'}`}>
        <div className="message-content">{message.content}</div>
        <div className="message-meta">
          <span className="message-time">{formatTime(message.createdAt)}</span>
          {isOwn && <TickIcon status={message.status || 'sent'} />}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
