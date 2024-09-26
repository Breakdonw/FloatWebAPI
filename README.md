
# Float

A finical Planning Tool.









## Installation

#### prequesites 

- A x64 Windows | | Linux server with [bun](http://bun.sh/)

- A postresSQL Server 16 or higher

###

First clone UI repository to local disk using git clone. 

```bash
  git clone https://github.com/Breakdonw/Float-Web-UI.git float-Frontend
```

Then clone api repository to local disk using git clone

```bash
  git clone https://github.com/Breakdonw/FloatWebAPI float-Backend
```

Move into the float backend directory, and create a .env file if one does not already exists. If one exists update the below values.

```prisma
JWTSECRET='example-jwt-token-phrase' -- Example value 
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"  --See [Prisma] Docs for more information on postgresql https://www.prisma.io/docs/orm/overview/databases/postgresql
```

Run the following command to install npm packages with bun
```bash
bun i
```

Now run these commands to setup database and ORM client packages.
```bash
bunx prisma generate
bunx prisma migrate deploy
```
if you recieve an error from the migrate command check your connection string or reference the prisma documentation for more information.

After doing this you will find a script in the prisma folder of the api files. Run this on your postgresql server on your Float database. This creates a trigger for automatically updating the users balance when a new transaction is udpated.

- Additionally if you need update all balances by force after running this. (This will take a while depending on how many transactions you have.)
```SQL
 update transactions set id = id where 1=1
```
Now run
```bash
bun run index.ts
```
This will start the server, you should recieve a message that categories were added to the DB. These are the default categories. 

You are now complete with the backend server setup.

To finish the install for the frontend, move into the directory and create a .env file. Either copy the following if running locally or replace local host with the ipv4/hostname of the backend server.
```env
VITE_API_SERVER_URL="http://20.151.87.138:5174"

```

Now run the following command to install npm packages with bun.
```
bun i
```

After doing so you have muliple options for how to run the server. 

```
add --host to the end of any of these commands will expose it to the rest of the internet provided the machine is port forwared.
```

For running in dev mode with vite 
```bash
bun run dev
```

For previewing production mode with vite
```
bun run preview 
```

For building to run as SPA (Single page application) on a web server 
```
bun run build
```

This concludes Instalation instructions




## Running Tests

To run tests for the api server, run the following command

```bash
  bun test
```


## Usage/Examples

* To use Float firstly create an account.
    - Navigate to the signup page (YourFrontEndAddress/signup)
    - Fill out the Signup Form
    - Press Submit.
* You should be brought to the dashboard. Once at the dahboard you will see 5 flashing squares. These are the modules of float each module has a name under it describing what data it is showing. To begin using or seeing these modules you will first need to add a financial account, then tranasactions.
    - To do so navigate to the bottom right and press the view/edit accounts
    - A modal will appear with a empty table. 
    - At the bottom left of the modal press the New + 
    - Fill out the form to add a bank account.
        - You may need to repeat the above step depending on how many accounts you would like to add.
    - Once completed you should see the account in the table with the details you provided.
        - you will notice that the balance is 0. This is recalculated when a transaction is added. if you would like to set an inital balance foregoing and previous history past a certain point feel free to add a deposit of that amount into the account in the following steps.
        - For savings accounts settings the Max balance field acts as a savings goal for the savings module.
    - Once you are done setting up your desired accounts click out of the model and click the add/edit tranasactions button.
    - At the bottom right of the modal press the New+ button and fill out the form for your transactions and submit.
        - Frequency is for reoccuring transactions
        - Category is for what Category the charge is related to.
        -  You may need to repeat the above step depending on how many tranasactions you would like to add.
    - Once complete you should see data in the table of the modal.
    - Exit the modal. if data does not immediately appear on the dashboard reload the page.

## Understanding the module views.
```
Any modules missing sufficent data will show up as flashing 
```
- At the top left the dashboard will show the spending breakdown.
    - This chart shows the total spending of the month and breaks it down by Category.
    - This is very useful if you are trying to visual see where most of your money is going.

- In the top right a scrolling list of reoccuring transaction will appear if any are present.


- in the bottom left a savings goal chart will appear. 
    - This lets you view the balance/trend of your savings account along with a goal project one yeah out and a predicted balance line.

    - At the bottom of this module it will show the account name, addtionally a next and previous button to switch between accounts
        - it should be noted that some savings accounts will not show up if they do not have sufficent transactions.

- To the right of the savings goal is the credit card spend chart.
    - This chart is an indication of how much you have spend on your credit card, how much is left to use and how much intrest you are going to be charged.
    - At the bottom of this module it will show the account name, addtionally a next and previous button to switch between accounts

- At the bottom right The welcome module will appear
    - This module will load regeardless of what tranasactions are present.
    - If you click the Add View accounts you can create / edit and delete accounts. Additionally at the header of the table some columns allow for filtering/searching if you have many accounts are looking for once with a specific name, balance, or Account number.
    - If you click the Add View tranasactions you can create / edit and delete tranasactions. Additionally at the header of the table some columns allow for filtering/searching if you have many accounts are looking for once with a specific name, Category, amount, etc...
    - The Export to CSV function allows you to Export your data to CSV format.
    - Signout will sign you out of the application.
    


