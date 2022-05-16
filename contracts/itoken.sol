//SPDX-License-Identifier:MIT
pragma solidity ^0.8.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    address public owner;

    struct Participant {
        address p;
        bool alive;
    }

    Participant[] public participants;
    uint256 public numParticipants;

    constructor() ERC20("iToken", "ILT") {
        owner = msg.sender;
        newParticipant(msg.sender);
        _mint(msg.sender, 1000 * (10**uint256(decimals())));
    }

    function exist(address _search) public view returns (bool) {
        bool found = false;
        uint256 i = 0;

        while (!found && i < participants.length) {
            found = participants[i].p == _search && participants[i].alive;
            i++;
        }

        return found;
    }

    function newParticipant(address _newPart) public {
        require(msg.sender == owner, "No eres el propietario del contrato");
        require(!exist(_newPart), "El usuario ya esta dado de alta");
        Participant memory regPart;
        regPart.p = _newPart;
        regPart.alive = true;
        participants.push(regPart);
        numParticipants++;
    }

    function delParticipant(address _delPart) public {
        require(msg.sender == owner, "No eres el propietario del contrato");
        require(exist(_delPart), "El usuario no existe");

        bool found = false;
        uint256 i = 0;

        while (!found && i < participants.length) {
            found = participants[i].p == _delPart && participants[i].alive;
            if (found) {
                participants[i].alive = false;
            }
            i++;
        }

        numParticipants--;
    }

    function mint(address _to, uint256 amount) public {
        require(msg.sender == owner, "No eres el propietario del contrato");
        _mint(_to, amount * (10**uint256(decimals())));
    }

    function burn(address _from, uint256 amount) public {
        require(msg.sender == owner, "No eres el propietario del contrato");
        _burn(_from, amount * (10**uint256(decimals())));
    }

    function distribute(uint256 price) public {
        require(price > 0);
        address[] memory list = addresses();
        if (list.length > 0) {
            uint256 amount = (price * (10**uint256(decimals()))) / list.length;
            for (uint256 i = 0; i < list.length; i++) {
                _mint(list[i], amount);
            }
        }
    }

    function addresses() public view returns (address[] memory) {
        address[] memory address_list = new address[](numParticipants);
        uint256 index;

        for (uint256 i = 0; i < participants.length; i++) {
            if (participants[i].alive) {
                address_list[index] = participants[i].p;
                index++;
            }
        }

        return address_list;
    }
}
