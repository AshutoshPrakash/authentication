var redis = require('redis');
var util = require('util');
var client = redis.createClient();

client.on('connect', function() {
    console.log('Redis : connected !!');
});

client.on('error', function(err) {
    console.log('Redis : ERROR '+err);
});

var R = {};
var U_FORMAT = "USER:%s";
var P_FORMAT = "PASS:%s";
var N_FORMAT = "NAME:%s";
var E_FORMAT = "MAIL:%s";

R.CheckLogin = function(user,pass,callback){
	client.hgetall(util.format(U_FORMAT,user), function(err, object) {
		if(err){
			console.log("Redis : hgetall("+util.format(U_FORMAT,user)+")  Error!!!");
			callback("Retry",null);
		}
	    else if(object==null){
	    	console.log("Redis : No login found for "+util.format(U_FORMAT,user));
			callback("Username not found..Signup First!",null);
	    }
	    else{
	    	if(object['PASS']==util.format(P_FORMAT,pass)){
	    		console.log("Redis : password matched for "+util.format(U_FORMAT,user));
	    		callback(null,{uid:user, password:pass});
	    	}
	    	else {
	    		console.log("Redis : Wrong password for "+util.format(U_FORMAT,user));
	    		callback("Wrong Password!...Retry Again",null);
	    	}
	    }
	});
}

R.NewUser = function(user,pass,name,email,callback){
	client.hgetall(util.format(U_FORMAT,user), function(err, object) {
		if(err){
			console.log("Redis : hgetall("+util.format(U_FORMAT,user)+")  Error!!!");
			callback("Retry",null);
		}
	    else if(!object){
	    	console.log("Redis : New Login Created for "+util.format(U_FORMAT,user));
	    	client.hmset(util.format(U_FORMAT,user),
				"PASS",util.format(P_FORMAT,pass),
				"NAME",util.format(N_FORMAT,name),
				"MAIL",util.format(E_FORMAT,email)
			);
            callback(null,"Done");
	    }
	    else{
	    	console.log("Redis : "+util.format(U_FORMAT,user)+" is  Already Signed up.");
	    	callback("Already_Exist",null);
	    }
	});
}

module.exports = R;
