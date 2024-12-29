Hello and welcome to Fruit Classifier!

To install dependencies in local env:

1. python3.12 -m venv env
2. source env/bin/activate
3. pip install -r requirements.txt

To setup Kaggle:

1. Visit https://www.kaggle.com/
2. Create an account
3. Go to 'Settings'
4. Under the 'Account' tab, select 'Create New Token'
5. Kaggle will download a kaggle.json object.
6. Relocate this object from 'Downloads' to ~/.kaggle (Kaggle will look for the object at ~/.kaggle/kaggle.json)
7. Now, your terminal will have access to the 'kaggle' keyword
8. Run: $kaggle datasets download -d moltean/fruits
9. Run: $unzip fruits.zip
10. You should now have both the resized 100x100 dataset and the original size dataset as directories in your working directory
