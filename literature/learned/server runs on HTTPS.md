
how to https local next.js::
run

 next dev --experimental-https 


API keys
Use API keys to authenticate API requests.

API keys
Use API keys to authenticate API requests.

api keys







The CA and Certificate(with the key)
The client( Browser or tools like postman) uses the CA certificate to authenticate the CA signature on the server certificate, as part of the authorizations before launching a secure connection.

we now have mkcert folder keys in our mkcert folder, about PEM files with SSL certificates::
PEM Files with SSL Certificates
PEM files are used to store SSL certificates and their associated private keys. Multiple certificates are in the full SSL chain, and they work in this order:

The end-user certificate, which is assigned to your domain name by a certificate authority (CA). This is the file you use in nginx and Apache to encrypt HTTPS.
Up to four optional intermediate certificates, given to smaller certificate authorities by higher authorities.
The root certificate, the highest certificate on the chain, which is self-signed by the primary CA.
Basically:: PEM files store certificates and their keys








server certificate::
for localhost, allow your local server to establish secure connections::

Step 2: Create a Server Certificate
Next, we’ll create a server certificate for your localhost. This certificate will allow your local server to establish secure connections. We’ll sign server’s certificate with the root certificate so our computer can trust the server’s authenticity.
then::
Generate a private key for the server:




basically to become a trusted entity on the internet and allow our local server to establish a secure connection we need to certificates, one for our PC to become a trusted source of certificate signatures and one signed certificate for our local server::


Step 1: Generate a Self-Signed Root Certificate
The first step is to create a self-signed root certificate. We will install this certificate in our computer and will sign another certificate that will be used by the server. When you install a root certificate, it means that you trust any other certificate signed by that root certificate.