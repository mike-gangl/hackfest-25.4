# Prompts for Demo

# Metadata compliance checker request for checking
```
Can you check the metadata compliance of /Users/gangl/Downloads/TROPESS_CrIS-JPSS1_L2_Summary_PAN_20220219_MUSES_R1p23_SC_MGLOS_F2p9_J0.nc. Based on the compliance check results, return 'compliant' or 'not compliant'. Compliant should be any file with no critical issues, and greater than 90% checks passed. Return your response ONLY as a json object with 2 keys: 'result' and 'reasoning'. 'result' should only be 'compliant' or 'non compliant'
```

## If not compliant...
```
Can you provide fixes for the erroneous metadata items? I don't want code to run to fix these issues, i want python and R examples of how to fix the various types of errors. 
```

In the above prompt, if you don't provide what you want _out_ of the code you ask to fix, you'll ned up getting (usually) a program you can run to "fix" the file you gave it. this might be waht you want, but i wanted a more 'tautology' example, where the program would show the user _how_ to fix something, but not show every single fix when many of them might be the same fix.


# umm-g Mappings
## Extract metadata
```
can you extract metadata from /Users/gangl/Downloads/TROPESS_CrIS-JPSS1_L2_Summary_PAN_20220219_MUSES_R1p23_SC_MGLOS_F2p9_J0.nc
```

## To umm-g schema (all fields)
```
Can you map the above metadata to umm-g from the NASA CMR Schema? Please provide the mappings of the metadata keys to the umm-g schema keys?
```

## To umm-g schema (all fields) (required fields)
```
Can you create a UMM-G CMR json file with only required fields? In general, if you're given 2 similarly named items with one as a 'date' and one as a 'time', you'll want to concatenate them in to a ISO 8601 datetime format.
```

in the above sample, i needed to add instructions in the prompt to concatenate date and time fields.

## umm-g mapping
 ```
 Please provide the mappings of the metadata keys to the required umm-g schema keys?
 ```