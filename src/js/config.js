// Backend origin is injected once, at build time.
// Vue CLI only exposes variables prefixed with VUE_APP_.
// GitHub Actions sets VUE_APP_API_URL from the API_BASE_URL repository variable.
const apiBaseUrl = (process.env.VUE_APP_API_URL || '').trim().replace(/\/+$/, '');

export const BASE_URL = apiBaseUrl;
// SockJS/STOMP endpoint is always <base>/ws (no leading space, no double slash).
export const WS_URL = apiBaseUrl ? `${apiBaseUrl}/ws` : '';

export const redirect_uri = "https://jamye.p-e.kr/oauth/redirect";
export const IMAGE_URL = "https://d23eha8a4ssn72.cloudfront.net";
export const redirectBaseUrl= "https://jamye.p-e.kr";

// export const redirect_uri = "http://localhost:8081/oauth/redirect";
// export const redirectBaseUrl= "http://localhost:8081";
// export const IMAGE_URL = "http://jamye-image-local.s3-website.ap-northeast-2.amazonaws.com";
