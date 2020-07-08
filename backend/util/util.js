
/*combine several arrays removing duplicate elements*/
function combineArrays(...arrays){
    let obj={};
    for(let x of arrays){
      for(let y of x){
        obj[y]=0;
      }
    }
    let combined=Object.getOwnPropertyNames(obj);
    return combined; 
  }
  
function reverseArray(arr){
    let tmp;
    for(let i=0;i<(arr.length/2);i++){
      tmp=arr[i];
      arr[i]=arr[arr.length-i-1];
      arr[arr.length-i-1]=tmp;
    }
  }

function processUser(user) {
  return {
      username: user.username,
      id: user._id,
      bio: user.bio,
      join_date: user.join_date,
      followers: user.followers,
      following: user.following
  }
}

exports.combineArrays=combineArrays;
exports.reverseArray=reverseArray;
exports.processUser=processUser;