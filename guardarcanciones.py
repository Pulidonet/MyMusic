from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.parse

class FormHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(length)
        data = urllib.parse.parse_qs(post_data.decode())

        email = data.get('email', [''])[0]
        comentario = data.get('comentario', [''])[0]

        with open("solicitudes.csv", "a", encoding="utf-8") as f:
            f.write(f"{email},{comentario}\n")

        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Solicitud recibida. Gracias!")

server = HTTPServer(('localhost', 8080), FormHandler)
print("Servidor corriendo en http://localhost:8080")
server.serve_forever()
