# SFAX Database Decryption

## Source

The encrypted CSV files are located in the SoftwareForArchers Xpert (SFAX) installation:

```
C:\PinwheelSoftware\OnTarget2!-SFAX\resources\DataBases\e-*.csv
```

## Encryption Method

The files use **hex-encoded XOR encryption** with a fixed repeating key.

### How it works

1. Each line in the `e-*.csv` file is a hex string (e.g., `7e5e4743467b4e140705320606`)
2. Convert the hex string to raw bytes
3. XOR each byte with the corresponding byte of the key (cycling)
4. The result is plain ASCII CSV text

### Key

```
TrustInGod
```

(10 bytes: `54 72 75 73 74 49 6e 47 6f 64`)

### Decryption Code (Python)

```python
KEY = b'TrustInGod'

def decrypt_line(hex_line):
    enc = bytes.fromhex(hex_line.strip())
    return bytes(e ^ KEY[i % len(KEY)] for i, e in enumerate(enc)).decode('ascii')

with open('e-ShaftData.csv', 'r') as f:
    for line in f:
        line = line.strip()
        if line:
            print(decrypt_line(line))
```

### Decryption Code (JavaScript/Node.js)

```javascript
const KEY = Buffer.from('TrustInGod');

function decryptLine(hexLine) {
  const enc = Buffer.from(hexLine.trim(), 'hex');
  const dec = Buffer.alloc(enc.length);
  for (let i = 0; i < enc.length; i++) {
    dec[i] = enc[i] ^ KEY[i % KEY.length];
  }
  return dec.toString('ascii');
}
```

## How the Key Was Discovered

1. The unencrypted `Print-Labels.csv` file revealed the CSV format:
   - Line 1: `*,DatasetName` (dataset identifier)
   - Line 2: `=,COL1,COL2,...` (column headers)
   - Lines starting with `-,` are manufacturer/section separators

2. Known-plaintext attack: assuming line 1 of `e-ShaftData.csv` starts with `*,` and line 2 starts with `=,MFG,MDL,`:
   - Byte 0: `0x7e XOR 0x2a ('*') = 0x54 ('T')`
   - Byte 1: `0x5e XOR 0x2c (',') = 0x72 ('r')`
   - Cross-validated with section separator line: `0x79 XOR 0x2d ('-') = 0x54 ('T')` (same key byte)

3. Extending with `=,MFG,MDL,` as known plaintext yielded: `TrustInGod`

4. Verified: line 1 decrypts to `*,2022 Shafts` -- correct.

## Decrypted File Format

### Bow Data (`dec-YYYY-BowData.csv`)

Columns: `MFG,MDL,IBO,A2A,BH,DL,DW,PLO,CAM,STR,CBL,CTL`

| Column | Description |
|--------|-------------|
| MFG | Manufacturer |
| MDL | Model name |
| IBO | IBO velocity (fps) |
| A2A | Axle-to-axle length (inches) |
| BH | Brace height (inches) |
| DL | Draw length range |
| DW | Draw weight range |
| PLO | Percent let-off |
| CAM | Cam type (Twin, Binary1, Binary2, Single, Hybrid) |
| STR | String length |
| CBL | Cable length |
| CTL | Control cable length |

### Shaft Data (`dec-ShaftData.csv`)

Columns: `MFG,MDL,SIZE,USE,OD,STKLEN,SPINE,GPI,PI,BPC,STDN`

| Column | Description |
|--------|-------------|
| MFG | Manufacturer (under `-,Manufacturer` section headers) |
| MDL | Model/size designation |
| SIZE | Size category |
| USE | Usage type (TC=Target Carbon, HC=Hunting Carbon, BC=Basic Carbon, etc.) |
| OD | Outer diameter (inches) |
| STKLEN | Stock length (inches) |
| SPINE | Static spine deflection |
| GPI | Grains per inch |
| PI | Point insert weight |
| BPC | Bushing/pin/collar weight |
| STDN | Standard nock weight |

### Fletch Data (`dec-FletchData.csv`)

### Nock Data (`dec-NockData.csv`)

## Data Volume

| File | Data Rows |
|------|-----------|
| Bow Data (2002-2022) | 7,298 |
| Shaft Data | 3,845 |
| Fletch Data | 321 |
| Nock Data | 434 |
| Sight Data | 340 |
