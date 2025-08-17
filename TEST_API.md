# Test API Integration

## Langkah-langkah untuk menguji integrasi API:

### 1. Login Flow
- Buka aplikasi dan masuk ke halaman login
- Masukkan email dan password yang valid
- Sistem akan memanggil API `/v1/auth/login/customer`
- Access token akan disimpan di AsyncStorage
- User akan diarahkan ke halaman utama

### 2. Tickets Flow
- Setelah login berhasil, buka halaman "Riwayat"
- Sistem akan otomatis memanggil API `/tickets` dengan Authorization header
- Data tickets akan ditampilkan dalam list
- Klik salah satu ticket untuk melihat detail

### 3. Data Structure Changes

#### Login Response (Baru):
```json
{
  "success": true,
  "message": "Login successful",
  "access_token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 900,
  "data": {
    "id": 1,
    "full_name": "Andi Saputra",
    "role": "customer",
    "email": "andi.saputra@example.com"
  }
}
```

#### Tickets Response (Baru):
```json
{
  "success": true,
  "message": "Tickets retrieved successfully",
  "data": [
    {
      "ticket_number": "BNI-00001",
      "description": "Kartu nasabah tertelan di ATM",
      "transaction_date": "2025-08-14T07:50:00Z",
      "amount": 0,
      "created_time": "2025-08-14T08:15:00Z",
      "closed_time": null,
      "customer_status": {
        "customer_status_id": 1,
        "customer_status_name": "Accepted",
        "customer_status_code": "ACC"
      },
      "issue_channel": {
        "channel_id": 1,
        "channel_name": "Automated Teller Machine",
        "channel_code": "ATM"
      },
      "customer": {
        "customer_id": 1,
        "full_name": "Andi Saputra",
        "email": "andi.saputra@example.com"
      },
      "related_account": {
        "account_id": 1,
        "account_number": 1234567890
      },
      "related_card": {
        "card_id": 1,
        "card_number": 4111111111111111,
        "card_type": "DEBIT"
      },
      "complaint": {
        "complaint_id": 1,
        "complaint_name": "2nd Chargeback",
        "complaint_code": "2ND_CHARGEBACK"
      }
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 10,
    "offset": 0,
    "pages": 1
  }
}
```

### 4. Status Mapping
- `ACC` → "Diterima"
- `VERIF` → "Validasi" 
- `PROCESS` → "Diproses"
- `CLOSED` → "Selesai"
- `DECLINED` → "Ditolak"

### 5. Files Modified
1. `hooks/useAuth.ts` - Updated login flow and data structure
2. `hooks/useTickets.ts` - New hook for fetching tickets with authorization
3. `app/(tabs)/riwayat.tsx` - Updated to use new tickets hook
4. `app/riwayat/[id].tsx` - Updated to use new data structure
5. `lib/api.ts` - Enhanced API helper

### 6. Key Features
- ✅ Access token authentication
- ✅ Automatic token storage
- ✅ Error handling for API calls
- ✅ Retry mechanism for failed requests
- ✅ Loading states
- ✅ Data mapping for status codes
- ✅ Backward compatibility maintained