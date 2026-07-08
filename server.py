from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import sys


class ModuleFriendlyHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.mjs': 'text/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.svg': 'image/svg+xml',
    }


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5177
    server = ThreadingHTTPServer(('127.0.0.1', port), ModuleFriendlyHandler)
    print(f'Serving synth-sfx-learning-tool at http://127.0.0.1:{port}', flush=True)
    server.serve_forever()


if __name__ == '__main__':
    main()
