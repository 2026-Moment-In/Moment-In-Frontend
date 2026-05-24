declare global {
  interface Window {
    kakao: any;
  }
}

const APP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY as string;

export function loadKakaoMapsSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), 10000);
    const done = () => {
      clearTimeout(timer);
      resolve();
    };

    if (window.kakao?.maps?.services?.Geocoder && window.kakao?.maps?.services?.Places) {
      done();
      return;
    }

    const runLoad = () => {
      window.kakao.maps.load(() => done());
    };

    if (document.getElementById("kakao-maps-sdk")) {
      if (window.kakao?.maps?.load) {
        runLoad();
      } else {
        const wait = setInterval(() => {
          if (window.kakao?.maps?.load) {
            clearInterval(wait);
            runLoad();
          }
        }, 50);
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "kakao-maps-sdk";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${APP_KEY}&libraries=services&autoload=false`;
    script.onload = runLoad;
    script.onerror = () => {
      clearTimeout(timer);
      reject(new Error("script load failed"));
    };
    document.head.appendChild(script);
  });
}
