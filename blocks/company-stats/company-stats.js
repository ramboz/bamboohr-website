import { readBlockConfig, readIndex } from "../../scripts/scripts.js";

function isNumber(str) {
  return !Number.isNaN(Number(str));
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  let options = config.options.split(',');
  options = options.map((element) => element.trim());

  if(options) {
    block.innerHTML = '<div class="company-stats-list"></div>';
    const companyStatsElement = block.querySelector('.company-stats-list');
    await readIndex('/company-stats.json', 'companyStats');
    const companyStats = window.pageIndex.companyStats.data;
    
    options.forEach((option) => {
      const statData = companyStats.filter(row => row.key === option)[0];
      let statDataText = statData.text;
      if (isNumber(statDataText)) statDataText = parseFloat(statDataText).toLocaleString();

      const stat = document.createElement('div');
      stat.className = 'company-stats-list-item';
      stat.innerHTML = `
      <span class="icon icon-${statData.icon}"></span>
      <div class="typ-section-header theme-shade-5">${statDataText}</div>
      <div class="typ-medium-info theme-shade-5">${statData.name}</div>`;
      companyStatsElement.append(stat);
    });
  }
}