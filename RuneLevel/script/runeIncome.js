const LEVEL_MIN = 1;
const LEVEL_MAX = 713;

const PLAYER_TYPE_HOST = 0;
const PLAYER_TYPE_FURLED_FINGER = 1;    // Cooperator
const PLAYER_TYPE_HUNTER = 2;           // Blue
const PLAYER_TYPE_DUELIST = 3;          // Red Summon
const PLAYER_TYPE_BLOODY_FINGER = 4;    // Invader
const PLAYER_TYPE_RECUSANT = 5;         // Invader

var playerTypeNames = [];
playerTypeNames[PLAYER_TYPE_HOST] = "Host";
playerTypeNames[PLAYER_TYPE_FURLED_FINGER] = "Furled Finger";
playerTypeNames[PLAYER_TYPE_HUNTER] = "Hunter";
playerTypeNames[PLAYER_TYPE_DUELIST] = "Duelist";
playerTypeNames[PLAYER_TYPE_BLOODY_FINGER] = "Bloody Finger";
playerTypeNames[PLAYER_TYPE_RECUSANT] = "Recusant";

var runeIncomePerEnemy = [];

runeIncomePerEnemy[PLAYER_TYPE_HOST] = [];
runeIncomePerEnemy[PLAYER_TYPE_HOST].push({ type: PLAYER_TYPE_BLOODY_FINGER,  multiplier: 0.15 });
runeIncomePerEnemy[PLAYER_TYPE_HOST].push({ type: PLAYER_TYPE_RECUSANT,       multiplier: 0.15 });
runeIncomePerEnemy[PLAYER_TYPE_HOST].push({ type: PLAYER_TYPE_DUELIST,        multiplier: 0.02 });

runeIncomePerEnemy[PLAYER_TYPE_FURLED_FINGER] = [];
runeIncomePerEnemy[PLAYER_TYPE_FURLED_FINGER].push({ type: PLAYER_TYPE_BLOODY_FINGER,  multiplier: 0.05 });
runeIncomePerEnemy[PLAYER_TYPE_FURLED_FINGER].push({ type: PLAYER_TYPE_RECUSANT,       multiplier: 0.05 });
runeIncomePerEnemy[PLAYER_TYPE_FURLED_FINGER].push({ type: PLAYER_TYPE_DUELIST,        multiplier: 0.01 });

runeIncomePerEnemy[PLAYER_TYPE_HUNTER] = runeIncomePerEnemy[PLAYER_TYPE_FURLED_FINGER];

runeIncomePerEnemy[PLAYER_TYPE_DUELIST] = [];
runeIncomePerEnemy[PLAYER_TYPE_DUELIST].push({ type: PLAYER_TYPE_HOST,          multiplier: 0.01 });
runeIncomePerEnemy[PLAYER_TYPE_DUELIST].push({ type: PLAYER_TYPE_FURLED_FINGER, multiplier: 0.01 });
runeIncomePerEnemy[PLAYER_TYPE_DUELIST].push({ type: PLAYER_TYPE_HUNTER,        multiplier: 0.01 });
runeIncomePerEnemy[PLAYER_TYPE_DUELIST].push({ type: PLAYER_TYPE_BLOODY_FINGER, multiplier: 0.01 });
runeIncomePerEnemy[PLAYER_TYPE_DUELIST].push({ type: PLAYER_TYPE_RECUSANT,      multiplier: 0.01 });
runeIncomePerEnemy[PLAYER_TYPE_DUELIST].push({ type: PLAYER_TYPE_DUELIST,       multiplier: 0.01 });

runeIncomePerEnemy[PLAYER_TYPE_BLOODY_FINGER] = [];
runeIncomePerEnemy[PLAYER_TYPE_BLOODY_FINGER].push({ type: PLAYER_TYPE_HOST,          multiplier: 0.04 });
runeIncomePerEnemy[PLAYER_TYPE_BLOODY_FINGER].push({ type: PLAYER_TYPE_FURLED_FINGER, multiplier: 0.04 });
runeIncomePerEnemy[PLAYER_TYPE_BLOODY_FINGER].push({ type: PLAYER_TYPE_HUNTER,        multiplier: 0.04 });
runeIncomePerEnemy[PLAYER_TYPE_BLOODY_FINGER].push({ type: PLAYER_TYPE_BLOODY_FINGER, multiplier: 0.01 });
runeIncomePerEnemy[PLAYER_TYPE_BLOODY_FINGER].push({ type: PLAYER_TYPE_RECUSANT,      multiplier: 0.01 });
runeIncomePerEnemy[PLAYER_TYPE_BLOODY_FINGER].push({ type: PLAYER_TYPE_DUELIST,       multiplier: 0.01 });

runeIncomePerEnemy[PLAYER_TYPE_RECUSANT] = runeIncomePerEnemy[PLAYER_TYPE_BLOODY_FINGER];

class runeIncomeCalculator
{
    updateOnChange = true;  // Disabled temporarily when modifying input fields without user intervention

    configuration = {
        playerType : PLAYER_TYPE_BLOODY_FINGER,
        enemyType : PLAYER_TYPE_FURLED_FINGER
    }

    populateEnemyTypeList(aInitialIndex = 0)
    {
        let output = "";

        this.configuration.enemyType = runeIncomePerEnemy[this.configuration.playerType][aInitialIndex].type;

        for (let i = 0; i < runeIncomePerEnemy[this.configuration.playerType].length; i++)
        {
            let thisEntry = runeIncomePerEnemy[this.configuration.playerType][i];
            let thisType = thisEntry.type;
            let thisName = playerTypeNames[thisType];
            let typeSelected = this.configuration.enemyType == thisType;
            let selectedString = typeSelected ? " selected" : "";
            output += `<option value="${runeIncomePerEnemy[this.configuration.playerType][i].type}"${selectedString}>${thisName}</option>`;
        }

        this.enemyTypeSelector.innerHTML = output;
    }

    calculateEnemyLevel()
    {
        let enemyTypeInfo = runeIncomePerEnemy[this.configuration.playerType];
        let incomeMultiplier = -1;
        let output = "???";
        for (let enemyIndex = 0; enemyIndex < enemyTypeInfo.length; enemyIndex++)
        {
            if (enemyTypeInfo[enemyIndex].type == this.configuration.enemyType)
            {
                incomeMultiplier = enemyTypeInfo[enemyIndex].multiplier;
                break;
            }
        }

        if (incomeMultiplier > 0)
        {
            let runesEarned = this.runeIncomeContainer.value;

            for (let incomeIndex = upgradeCosts.length - 1; incomeIndex >= 0; incomeIndex--)
            {
                let earnedForThisLevel = Math.floor(upgradeCosts[incomeIndex] * incomeMultiplier);

                if (incomeIndex == 0 && runesEarned < earnedForThisLevel)   // RL1 (or below, since I don't know what the number actually is)
                {
                    output = `<span>&le;1</span><p>For level 2: <b>${earnedForThisLevel}</b> runes</p>`;
                    break;
                }
                else if (runesEarned == earnedForThisLevel)
                {
                    let earnedForPrevLevel = incomeIndex > 0 ? Math.floor(upgradeCosts[incomeIndex - 1] * incomeMultiplier) : -1;
                    let prevLevelString = (earnedForThisLevel == earnedForPrevLevel) ? `<p>Level ${incomeIndex + 1} is also <b>${earnedForPrevLevel}</b> runes</p>` : "";
                    let sameIncomeTilde = (earnedForThisLevel == earnedForPrevLevel) ? `&tilde;` : "";
                    output = `<span>${sameIncomeTilde}${incomeIndex + 2}</span>` + prevLevelString;
                    break;
                }
                else if (runesEarned > earnedForThisLevel)
                {
                    let earnedForNextLevel = incomeIndex >= 0 && (incomeIndex + 1 < upgradeCosts.length) ? Math.floor(upgradeCosts[incomeIndex + 1] * incomeMultiplier) : -1;
                    let showCurLevel = (runesEarned > earnedForThisLevel);
                    let curLevelString = showCurLevel ? `<p>For level ${incomeIndex + 2}: <b>${earnedForThisLevel}</b> runes</p>` : "";

                    let showNextLevel = (earnedForNextLevel != -1) && ((earnedForThisLevel == earnedForNextLevel) || runesEarned > earnedForThisLevel);
                    let nextLevelString = showNextLevel ? `<p>For level ${incomeIndex + 3}: <b>${earnedForNextLevel}</b> runes</p>` : "";
                    let gtString = showCurLevel ? `&gt;` : "";

                    output = `<span>${gtString}${incomeIndex + 2}</span>` + curLevelString + nextLevelString;
                    break;
                }
            }
        }

        this.runeLevelContainer.innerHTML = output;
    }

    onPlayerTypeChanged()
    {
        this.configuration.playerType = this.playerTypeSelector.value;
        this.updateOnChange = false;
        this.populateEnemyTypeList();
        this.configuration.enemyType = this.enemyTypeSelector.value;
        this.updateOnChange = true;
        this.calculateEnemyLevel();
    }

    onEnemyTypeChanged()
    {
        this.configuration.enemyType = this.enemyTypeSelector.value;
        this.calculateEnemyLevel();
    }

    onRuneIncomeChanged()
    {
        this.calculateEnemyLevel();
    }

	initialize()
	{
        this.playerTypeSelector = document.getElementById("playerType");
        this.enemyTypeSelector = document.getElementById("enemyType");
        this.runeIncomeContainer = document.getElementById("runeIncome");
        this.runeLevelContainer = document.getElementById("outputRuneLevel");

        for (let i = 0; i < playerTypeNames.length; i++)
        {
            let defaultSelectionString = this.configuration.playerType == i ? " selected": "";
            this.playerTypeSelector.innerHTML += `<option value="${i}"${defaultSelectionString}>${playerTypeNames[i]}</option>`;
        }

        this.populateEnemyTypeList(1);

        this.runeIncomeContainer.value = 3616;
        this.calculateEnemyLevel();

        this.playerTypeSelector.addEventListener("change", this.onPlayerTypeChanged.bind(this));
        this.enemyTypeSelector.addEventListener("change", this.onEnemyTypeChanged.bind(this));
        this.runeIncomeContainer.addEventListener("change", this.onRuneIncomeChanged.bind(this));
    }
}

var toolInstance = new runeIncomeCalculator();