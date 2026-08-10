import Image from 'next/image';

import MobileLinkShareButton from '@/components/landing/MobileLinkShareButton';

const features = [
  {
    description: '배포된 웹페이지의 URL이나 HTML 코드를 입력해 바로 분석할 수 있어요.',
    icon: '/globe.svg',
    title: '주소나 코드로 바로 분석',
  },
  {
    description: '선택한 스크린 리더를 기준으로 생성된 예상 탐색 순서를 대본과 음성으로 확인해요.',
    icon: '/eye.svg',
    title: '읽히는 순서를 대본과 음성으로 확인',
  },
  {
    description: '접근성 이슈와 영향을 받는 요소를 분석 대상 화면과 함께 확인할 수 있어요.',
    icon: '/code.svg',
    title: '문제 요소를 원본 화면과 함께 발견',
  },
];

export default function MobileLanding() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl dark:bg-blue-900/20"
      />
      <div
        aria-hidden="true"
        className="absolute top-[38rem] -left-36 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl dark:bg-emerald-900/20"
      />

      <div className="relative mx-auto max-w-lg">
        <header className="flex h-16 items-center px-5">
          <span className="text-base font-bold tracking-tight">Screen Reader Studio</span>
        </header>

        <section aria-labelledby="mobile-landing-title" className="px-5 pt-14 pb-16">
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200">
            웹 접근성 분석 도구
          </p>
          <h1
            id="mobile-landing-title"
            className="mt-5 text-4xl leading-tight font-bold tracking-tight break-keep"
          >
            스크린 리더가 읽는 웹을, 개발 중에 미리 확인하세요.
          </h1>
          <p className="mt-5 text-lg leading-8 break-keep text-gray-600 dark:text-gray-300">
            웹페이지 URL이나 HTML 코드를 입력하면 예상 스크린 리더 대본과 접근성 문제를 한 화면에서
            확인할 수 있어요.
          </p>

          <div
            aria-hidden="true"
            className="mt-10 rotate-1 rounded-3xl border border-gray-200 bg-white p-4 shadow-[0_24px_70px_-28px_rgba(37,99,235,0.45)] dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-300 dark:bg-red-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-300 dark:bg-yellow-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 dark:bg-emerald-500/70" />
              </div>
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                분석 예시
              </span>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <Image src="/globe.svg" alt="" width={16} height={16} className="dark:invert" />
                <span className="truncate font-mono text-xs text-gray-600 dark:text-gray-300">
                  https://example.com
                </span>
                <span className="ml-auto shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[0.625rem] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  분석 완료
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950/50">
                <Image src="/eye.svg" alt="" width={20} height={20} className="dark:invert" />
                <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">스크린 리더 대본</p>
                <p className="mt-1 text-lg font-bold text-blue-700 dark:text-blue-200">24개</p>
              </div>
              <div className="rounded-xl bg-orange-50 p-3 dark:bg-orange-950/40">
                <Image src="/code.svg" alt="" width={20} height={20} className="dark:invert" />
                <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">접근성 이슈</p>
                <p className="mt-1 text-lg font-bold text-orange-700 dark:text-orange-200">3개</p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="mobile-features-title" className="px-5 py-16">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">핵심 기능</p>
          <h2
            id="mobile-features-title"
            className="mt-3 text-3xl font-bold tracking-tight break-keep"
          >
            접근성 문제를 더 빠르게 발견하세요.
          </h2>
          <ul className="mt-8 space-y-4">
            {features.map((feature) => (
              <li
                key={feature.title}
                className="rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/90"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                  <Image src={feature.icon} alt="" width={24} height={24} className="dark:invert" />
                </div>
                <h3 className="mt-5 text-lg font-bold break-keep">{feature.title}</h3>
                <p className="mt-2 leading-7 break-keep text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="px-5 pt-16 pb-10 text-center" aria-labelledby="mobile-device-title">
          <div className="rounded-3xl bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-6 ring-1 ring-gray-200 dark:from-blue-950/60 dark:via-gray-900 dark:to-emerald-950/50 dark:ring-gray-700">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-200">태블릿 · PC</p>
            <h2
              id="mobile-device-title"
              className="mt-3 text-3xl font-bold tracking-tight break-keep"
            >
              분석은 더 넓은 화면에서 시작해 주세요.
            </h2>
            <p className="mt-4 leading-7 break-keep text-gray-600 dark:text-gray-300">
              분석 대상과 원본 화면, 스크린 리더 대본, 접근성 이슈를 함께 비교할 수 있도록 768px
              이상의 태블릿과 PC에서 제공하고 있어요.
            </p>
            <div className="mt-7">
              <MobileLinkShareButton />
            </div>
            <p className="mt-1 text-xs leading-5 break-keep text-gray-500 dark:text-gray-400">
              공유 기능을 지원하지 않는 브라우저에서는 링크가 자동으로 복사돼요.
            </p>
          </div>
        </section>

        <footer className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Screen Reader Studio
        </footer>
      </div>
    </div>
  );
}
