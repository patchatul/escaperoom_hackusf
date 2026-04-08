from dataBaseConnection import myPeduncle

class PlayerRepo:

    # Inserting the new player into the database 
    def insertPlayer(self,username,pwd,email):
        sql = ("INSERT INTO user_data(user_name, user_pwd, user_email)"
                "VALUES (%s, %s, %s)")
        vals = (
            username,
            pwd,
            email,
        )
        myPeduncle.execute(sql, vals)
        


    # Delete the player using their userid
    def deletePlayer(self, userid):
        myPeduncle.execute("DELETE FROM user_data WHERE user_id = %s", (userid,))

    # Getting the players data excluding the password
    def getPlayers(self):
        myPeduncle.execute("select * from user_data")

        values = myPeduncle.fetchall()
        keys =[key[0] for key in myPeduncle.description]

        allPlayers = []
        for val in values:
            player = {}
            for i in range(len(keys)):
                if keys[i] != 'user_pwd':
                    player[keys[i]] = val[i]
            allPlayers.append(player)

        return allPlayers
    
    # First check if the username is in the DB then check if its the correct pwd
    def CheckLogin(self,username,userpwd):
        myPeduncle.execute("Select user_id, user_pwd from user_data where user_name = %s",(username,))

        #result contains of tuple of the data selected from the row
        DB_result = myPeduncle.fetchone()

        # this is when the result does have the data thats in the DB
        if DB_result:

            #unpack the tuple result
            DB_userID, DB_userPWD = DB_result 
            
            if(DB_userPWD == userpwd):
                return {
                    "status": "Successful"
                }
        
        return{
            "status": "Error"
        }
