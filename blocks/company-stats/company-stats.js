import { readBlockConfig, readIndex } from "../../scripts/scripts.js";

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const options = config.options.split(', ');

  if(options) {
    block.innerHTML = '<div class="company-stats-list"></div>';
    const companyStatsElement = block.querySelector('.company-stats-list');
    await readIndex('/company-stats.json', 'companyStats');
    const companyStats = window.pageIndex.companyStats.data;
    
    options.forEach((option) => {
      const statData = companyStats.filter(row => row.key === option)[0];
      const stat = document.createElement('div');
      stat.className = 'company-stats-list-item';
      stat.innerHTML = `
      <span class="icon icon-${statData.icon}"></span>
      <div class="typ-section-header theme-shade-5">${statData.text}</div>
      <div class="typ-medium-info theme-shade-5">${statData.name}</div>`;
      companyStatsElement.append(stat);
    });
  }
}