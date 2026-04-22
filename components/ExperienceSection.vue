<template>
  <section class="experience" id="experience">
    <a href="#experience">
      <h2 class="text-2xl font-bold name">Experience</h2>
    </a>
    <div class="timeline">
      <div
        v-for="(exp, index) in experiences"
        :key="index"
        class="experience-item"
      >
        <div class="timeline-dot" />
        <div class="experience-content">
          <div class="experience-header">
            <div class="left">
              <h3 class="role">{{ exp.role }}</h3>
              <p class="company">{{ exp.company }}</p>
            </div>
            <p class="timeframe">{{ exp.timeframe }}</p>
          </div>
          <p class="description">{{ exp.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "ExperienceSection",
  data() {
    return {
      experiences: [
        {
          role: "Software Engineer",
          company: "Orbitax",
          timeframe: "Mar 2024 – Present",
          description:
            "Database modernization, microservices, security hardening, cost optimization. Worked across the stack — migrated SQL Server to MongoDB, built a Python CQRS service bridging SignalR with RabbitMQ, tightened up CSP and RBAC on the identity platform, and helped ship XatBot, an LLM-powered tax assistant over a 70k-document corpus. Also integrated XatBot into Claude Connectors via OAuth.",
        },
        {
          role: "Associate Software Engineer",
          company: "Orbitax",
          timeframe: "Mar 2022 – Feb 2024",
          description:
            "Remediated critical SAML SSO misconfigurations flagged by a Big 4 audit firm and assumed full ownership of the legacy Identity Provider. Stabilized passwordless MagicLink login, implemented RFC 6238 TOTP multi-factor authentication, and decoupled the admin application onto an isolated domain to reduce public attack surface. Delivered Net Operating Loss calculation module .",
        },
        {
          role: "Software Engineer Intern",
          company: "Orbitax",
          timeframe: "Sep 2021 – Feb 2022",
          description:
            "Ported a high-throughput .NET microservice to Go — achieving 60% latency reduction and 70% memory reduction. Built automated JMeter load-testing infrastructure via batch scripting, and contributed data-extraction tooling to the internal workflow engine. Converted to full-time on completion.",
        },
      ],
    };
  },
};
</script>

<style scoped>
.section-label {
  font-size: 0.7rem;
  font-family: "Inter", "ui-sans-serif", system-ui, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--accent-text-color);
  margin-bottom: 0.75rem;
  margin-top: 0;
}

.experience {
  margin-bottom: 2rem;
}

.timeline {
  position: relative;
  padding-left: 1.25rem;
  border-left: 2px solid var(--border-color);
}

.experience-item {
  position: relative;
  display: flex;
}

.timeline-dot {
  position: absolute;
  left: -6px;
  top: 0.45rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-color);
  border: 2px solid var(--background-color);
  flex-shrink: 0;
  transform: scale(0);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

section.revealed .timeline-dot { transform: scale(1); }
section.revealed .experience-item:nth-child(1) .timeline-dot { transition-delay: 0.10s; }
section.revealed .experience-item:nth-child(2) .timeline-dot { transition-delay: 0.17s; }
section.revealed .experience-item:nth-child(3) .timeline-dot { transition-delay: 0.24s; }

.experience-content {
  padding: 0 0 1.75rem 1rem;
  flex: 1;
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.25rem;
}

.experience-header .role,
.experience-header .company,
.experience-header .timeframe {
  color: var(--accent-text-color);
  font-family: "Inter", "ui-sans-serif", system-ui, sans-serif;
}

.experience-header .role {
  color: var(--link-color-hover);
}

.role {
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0;
}

.company {
  margin: 0.25rem 0 0;
  font-size: 1rem;
}

.timeframe {
  font-size: 0.9rem;
  text-align: right;
}

.description {
  font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
  font-size: 0.95rem;
  line-height: 1.75;
  margin: 0.5rem 0 0;
}
</style>
