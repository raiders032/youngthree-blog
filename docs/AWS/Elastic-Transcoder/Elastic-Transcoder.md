## 1 AWS Elastic Transcoder 소개

- AWS Elastic Transcoder는 클라우드 기반의 미디어 트랜스코딩 서비스입니다.
- 이를 통해 사용자는 다양한 입력 파일을 원하는 출력 형식으로 변환할 수 있습니다.
- Elastic Transcoder는 비디오 파일을 다양한 디바이스에서 최적화된 형식으로 제공할 수 있도록 도와줍니다.



## 2. 주요 기능

### 2.1 다양한 입력 및 출력 형식 지원

- Elastic Transcoder는 여러 비디오 및 오디오 형식을 입력으로 지원합니다.
- MP4, HLS, WebM 등 다양한 출력 형식을 제공하여 다양한 디바이스와 호환됩니다.
- 출력 형식
	- [레퍼런스](https://aws.amazon.com/elastictranscoder/details/)
	- HLS using an MPEG-2 TS container to house H.264 video and AAC or MP3 audio  
	- Smooth Streaming using an fmp4 container to house H.264 video and AAC audio  
	- MPEG-DASH using an fmp4 container to house H.264 video and AAC audio  
	- XDCAM using MXF container using MPEG-2 video and PCM audio  
	- MP4 container with H.264 video and AAC or MP3 audio  
	- WebM container with VP9 video and Vorbis audio  
	- WebM container with VP8 video and Vorbis audio  
	- FLV container with H.264 video and AAC or MP3 audio  
	- MPG container with MPEG-2 video and MP2 audio  
	- MP3 container with MP3 audio  
	- MP4 container with AAC audio  
	- OGG container with Vorbis or FLAC audio  
	- OGA container with FLAC audio  
	- FLAC container with FLAC audio  
	- WAV container with PCM audio  
	- Animated GIF



### 2.2 사용하기 쉬운 워크플로

- Elastic Transcoder는 AWS Management Console, CLI, SDK를 통해 쉽게 사용할 수 있습니다.
- 사용자는 미디어 파일을 S3에 업로드하고, 트랜스코딩 작업을 설정하면 됩니다.




### 2.3 프리셋 및 사용자 정의 설정

- Elastic Transcoder는 다양한 프리셋을 제공하여 빠르게 트랜스코딩 작업을 설정할 수 있습니다.
- 필요에 따라 사용자 정의 프리셋을 생성하여 세부 설정을 조정할 수 있습니다.




### 2.4 출력 파일 관리

- 트랜스코딩된 출력 파일은 자동으로 S3에 저장되며, 필요한 경우 CloudFront와 연동하여 콘텐츠를 배포할 수 있습니다.
- 출력 파일의 메타데이터를 설정하고 관리할 수 있습니다.



### 2.5 비용 효율성

- Elastic Transcoder는 사용한 만큼만 비용을 지불하는 유연한 가격 모델을 제공합니다.
- 비디오 분당 가격이 책정되며, 트랜스코딩된 출력의 해상도와 길이에 따라 비용이 달라집니다.
- [Elastic Transcoder 가격 페이지](https://aws.amazon.com/elastictranscoder/pricing/)



## 3. 사용 사례

### 3.1 비디오 스트리밍 서비스

- Elastic Transcoder를 사용하여 다양한 디바이스에 최적화된 형식으로 비디오를 트랜스코딩할 수 있습니다.
- HLS, DASH 등의 스트리밍 형식을 지원하여 안정적인 비디오 스트리밍 서비스를 제공할 수 있습니다.



### 3.2 교육 콘텐츠 제공

- 교육용 비디오 콘텐츠를 다양한 해상도로 트랜스코딩하여 여러 디바이스에서 접근할 수 있도록 합니다.
- 낮은 해상도로 변환하여 데이터 사용량을 절약하고, 높은 해상도로 변환하여 고품질 시청 경험을 제공합니다.