# DocumentDB 비용 구성 요소와 최적화 전략 (개발 환경 기준)

## 1. 현재 개발 환경 비용 분석

### 1.1 인스턴스 비용 (Monthly: $86.87)
- **인스턴스 유형**: db.t3.medium
- **스펙**:
  - vCPU: 2
  - 메모리: 4 GiB
- **시간당 비용**: $0.119
- **계산**: $0.119 × 730시간 = $86.87

### 1.2 스토리지 및 I/O 비용 (Monthly: $12.24)
- **스토리지 비용**:
  - 100GB × $0.12 = $12.00
- **I/O 비용**:
  - 1,000,000 요청 × $0.00000024 = $0.24
  - 계산: ($12.00 + $0.24 = $12.24)

### 1.3 백업 스토리지 비용 (Monthly: $2.30)
- **백업 용량**: 100GB
- **계산**: 100GB × $0.023 = $2.30

### 1.4 총 월별 비용: $101.41
- 인스턴스: $86.87
- 스토리지 및 I/O: $12.24
- 백업: $2.30

## 2. 비용 최적화 전략

### 2.1 운영 시간 최적화
```plaintext
현재 운영: 24/7 (730시간/월)
최적화 후: 평일 9시-18시 (180시간/월)

비용 절감 예상:
- 인스턴스: $86.87 → $21.42 (180시간 × $0.119)
- 절감액: $65.45 (75.3% 절감)
```

### 2.2 스토리지 최적화
1. **데이터 정리**
  - 30일 이상 된 데이터 S3 아카이빙
  - 예상 스토리지 절감: 30-50%
  - 100GB → 50GB: $12.24 → $6.12

2. **백업 전략**
  - 개발 환경 백업 보관 기간 최소화
  - 데이터 크기 감소에 따른 백업 비용 감소
  - $2.30 → $1.15 (50GB 기준)

### 2.3 인스턴스 최적화 전략
```yaml
# 운영 시간 자동화
EventBridge:
  Start:
    Schedule: "0 0 ? * MON-FRI *"  # 09:00 KST
    Action: "StartDB"
  Stop:
    Schedule: "0 9 ? * MON-FRI *"  # 18:00 KST
    Action: "StopDB"
```

## 3. 최적화 후 예상 비용

### 3.1 최적화 적용 후 월 비용
1. 인스턴스 비용
   - $21.42 (180시간 운영)
2. 스토리지 및 I/O
   - 스토리지: $6.00 (50GB)
   - I/O: $0.12 (50% 감소)
   - 합계: $6.12
3. 백업 스토리지
   - $1.15 (50GB)

총 예상 비용: $28.69
절감액: $72.72 (71.7% 절감)