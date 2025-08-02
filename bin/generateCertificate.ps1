# Create a self-signed exportable certificate
$cert = New-SelfSignedCertificate `
  -DnsName localhost `
  -Subject "CN=localhost" `
  -KeyLength 2048 `
  -CertStoreLocation "Cert:\CurrentUser\My\" `
  -KeyExportPolicy Exportable

$certBase64 = [System.Convert]::ToBase64String($cert.RawData, [System.Base64FormattingOptions]::InsertLineBreaks)

$pem = @"
-----BEGIN CERTIFICATE-----
$certBase64
-----END CERTIFICATE-----
"@

Set-Content -Value $pem -Path "localhost.crt"

$RSACng = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($cert)
$keyBytes = $RSACng.Key.Export([System.Security.Cryptography.CngKeyBlobFormat]::Pkcs8PrivateBlob)
$privateKeyBase64 = [System.Convert]::ToBase64String($keyBytes, [System.Base64FormattingOptions]::InsertLineBreaks)

$key = @"
-----BEGIN PRIVATE KEY-----
$privateKeyBase64
-----END PRIVATE KEY-----
"@

Set-Content -Value $key -Path "localhost.key"
