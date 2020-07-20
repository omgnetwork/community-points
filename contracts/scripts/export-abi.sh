echo "Start export ABIs..."
echo "======================"

for contract_file in $(ls build/contracts); do
    contract_name="${contract_file%%.*}"
    echo "> Exporting ABI of ${contract_name}"
    cat "build/contracts/${contract_file}" | jq ".abi" > "abis/${contract_name}.json"
done

echo "> All ABIs exported to 'abis/' folder"
