export default function UnsupportedDevice() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center bg-gray-100 p-5 text-center dark:bg-gray-900">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-black sm:text-3xl dark:text-gray-100">
          서비스 이용 안내
        </h1>
        <p className="mt-4 text-base break-keep text-gray-900 sm:text-lg dark:text-gray-300">
          이 서비스는 태블릿 및 데스크톱 환경에 최적화되어 있습니다.
          <br />
          원활한 사용을 위해 768px 이상의 화면에서 접속해 주세요.
        </p>
      </div>
    </div>
  );
}
