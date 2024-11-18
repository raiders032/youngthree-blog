## 1 FSx for OpenZFS

- AWS에서 관리되는 OpenZFS 파일 시스템입니다.
- NFS(v3, v4, v4.1, v4.2) 프로토콜과 호환되는 파일 시스템입니다.
- ZFS에서 실행 중인 워크로드를 AWS로 이동할 수 있습니다.
- 다음과 함께 작동합니다:
    - Linux
    - Windows
    - MacOS
    - VMware Cloud on AWS
    - Amazon Workspaces 및 AppStream 2.0
    - Amazon EC2, ECS 및 EKS
- 최대 1,000,000 IOPS와 0.5ms 미만의 지연 시간을 제공합니다.
- 스냅샷, 압축 및 저비용 기능을 제공합니다.
- 시점(Point-in-time) 즉시 클로닝 기능을 제공하여 새로운 워크로드 테스트에 유용합니다.



> [!NOTE] OpenZFS
> OpenZFS는 Sun Microsystems가 Solaris 운영 체제를 위해 처음 개발한 ZFS 파일 시스템과 볼륨 관리자(Volume Manager)의 오픈 소스 구현입니다. 현재는 OpenZFS 프로젝트에 의해 유지 관리되고 있습니다. OpenZFS는 데이터 압축, 데이터 중복 제거, 카피 온 라이트(Copy-on-Write) 클론, 스냅샷, RAID-Z 등의 기능을 지원합니다. 또한, 여러 디스크에 걸쳐 파일 시스템을 생성할 수 있는 가상 장치(Virtual Device) 생성도 지원합니다.
> 
> OpenZFS는 엔터프라이즈 및 데이터 센터 환경뿐만 아니라 네트워크 연결 스토리지(NAS) 장치와 같은 소비자 장치에서도 널리 사용되고 있습니다. Linux, FreeBSD, macOS, Windows(서드 파티 솔루션을 통해) 운영 체제에서 사용할 수 있습니다. OpenZFS는 CDDL(Common Development and Distribution License) 라이선스하에 제공되어 오픈 소스 및 상업적 사용이 모두 가능합니다.
