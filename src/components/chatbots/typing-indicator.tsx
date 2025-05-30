const TypingIndicator = () => {
  return (
    <div className="flex justify-start gap-3 flex-row">
      <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden mt-2">
        <img
          src="/cci-logo.png"
          alt="CCI Logo"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="mt-2 flex items-center">
        <div className="flex space-x-1">
          <div
            className="w-1 h-1 bg-gray-600 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          ></div>
          <div
            className="w-1 h-1 bg-gray-600 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          ></div>
          <div
            className="w-1 h-1 bg-gray-600 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
