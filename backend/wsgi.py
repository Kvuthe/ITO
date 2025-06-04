from app import app

if __name__ == '__main__':
    print("Starting flask server...")
    app.run(debug=True, host="0.0.0.0", port=6005)