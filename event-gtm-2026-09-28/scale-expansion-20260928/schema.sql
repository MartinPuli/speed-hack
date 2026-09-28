CREATE INDEX assertions_entity ON assertions(entity_table,entity_id,field);

CREATE INDEX editions_date ON event_editions(start_date,country);

CREATE INDEX role_lookup ON event_company_roles(company_id,event_id);

CREATE INDEX scale_assertion_entity_field ON assertions(entity_table,entity_id,field);

CREATE INDEX scale_event_date ON event_editions(start_date);

CREATE INDEX scale_event_source ON scale_event_metadata(source_family);

CREATE INDEX scale_geo ON scale_event_metadata(latitude,longitude);

CREATE INDEX scale_observation_event ON scale_observations(event_id);

CREATE TABLE "assertions" ("id" TEXT PRIMARY KEY,"entity_table" TEXT,"entity_id" TEXT,"field" TEXT,"value_json" TEXT,"source_id" TEXT,"locator" TEXT,"evidence_paraphrase" TEXT,"valid_from" TEXT,"valid_to" TEXT,"observed_at" TEXT,"evidence_class" TEXT,"confidence_basis" TEXT,"conflict_status" TEXT);

CREATE TABLE "audience_metrics" ("id" TEXT PRIMARY KEY,"event_id" TEXT,"segment" TEXT,"metric" TEXT,"value" TEXT,"unit" TEXT,"denominator" TEXT,"period" TEXT,"method" TEXT,"metric_status" TEXT,"source_id" TEXT);

CREATE TABLE "audience_overlap" ("id" TEXT PRIMARY KEY,"entity_a_id" TEXT,"entity_b_id" TEXT,"universe" TEXT,"method" TEXT,"denominator" TEXT,"value" TEXT,"unit" TEXT,"period" TEXT,"limitations" TEXT,"version" TEXT,"input_ids_json" TEXT,"cutoff" TEXT);

CREATE TABLE "communities" ("id" TEXT PRIMARY KEY,"name" TEXT,"company_id" TEXT,"topic" TEXT,"geography" TEXT,"url" TEXT,"public_channels_json" TEXT,"source_id" TEXT);

CREATE TABLE "community_event_links" ("id" TEXT PRIMARY KEY,"community_id" TEXT,"event_id" TEXT,"role" TEXT,"valid_from" TEXT,"valid_to" TEXT,"source_id" TEXT);

CREATE TABLE "companies" ("id" TEXT PRIMARY KEY,"name" TEXT,"domain" TEXT,"company_url" TEXT,"aliases_json" TEXT,"description" TEXT,"industry" TEXT,"products_json" TEXT,"markets_json" TEXT,"size_text" TEXT,"missing_reasons_json" TEXT,"source_id" TEXT);

CREATE TABLE "company_profile_history" ("id" TEXT PRIMARY KEY,"company_id" TEXT,"version" TEXT,"products_json" TEXT,"value_proposition" TEXT,"audiences_json" TEXT,"markets_json" TEXT,"size_text" TEXT,"observed_at" TEXT,"valid_from" TEXT,"valid_to" TEXT,"source_id" TEXT);

CREATE TABLE "company_signals" ("id" TEXT PRIMARY KEY,"company_id" TEXT,"signal_type" TEXT,"fact_date" TEXT,"geography" TEXT,"fact" TEXT,"hypothesis" TEXT,"source_id" TEXT);

CREATE TABLE "competitors" ("id" TEXT PRIMARY KEY,"name" TEXT,"url" TEXT,"category" TEXT,"buyer" TEXT,"capabilities_json" TEXT,"availability" TEXT,"data_coverage" TEXT,"refresh" TEXT,"integrations_json" TEXT,"export_access" TEXT,"public_price" TEXT,"price_currency" TEXT,"limitations" TEXT,"source_id" TEXT);

CREATE TABLE "crawl_runs" ("id" TEXT PRIMARY KEY,"method" TEXT,"extractor_version" TEXT,"scope" TEXT,"started_at" TEXT,"finished_at" TEXT,"pages_attempted" TEXT,"pages_completed" TEXT,"pages_failed" TEXT,"records_output" TEXT,"measured_cost_usd" TEXT,"billing_status" TEXT,"closure_reason" TEXT);

CREATE TABLE "customer_briefs" ("id" TEXT PRIMARY KEY,"customer_id" TEXT,"website" TEXT,"objective" TEXT,"offer" TEXT,"audience" TEXT,"geography" TEXT,"dates_json" TEXT,"budget" TEXT,"currency" TEXT,"constraints_json" TEXT,"priorities_json" TEXT,"version" TEXT);

CREATE TABLE "data_conflicts" ("id" TEXT PRIMARY KEY,"entity_table" TEXT,"entity_id" TEXT,"field" TEXT,"assertion_ids_json" TEXT,"resolution" TEXT,"status" TEXT,"reviewer" TEXT,"source_id" TEXT);

CREATE TABLE "distribution_channels" ("id" TEXT PRIMARY KEY,"company_id" TEXT,"name" TEXT,"channel_type" TEXT,"topic" TEXT,"geography" TEXT,"url" TEXT,"access_terms" TEXT,"declared_size" TEXT,"size_observed_at" TEXT,"source_id" TEXT);

CREATE TABLE "distribution_metrics" ("id" TEXT PRIMARY KEY,"channel_id" TEXT,"metric" TEXT,"value" TEXT,"unit" TEXT,"period" TEXT,"scope" TEXT,"method" TEXT,"source_id" TEXT);

CREATE TABLE "draft_field_evidence" ("id" TEXT PRIMARY KEY,"draft_id" TEXT,"field" TEXT,"value_json" TEXT,"origin" TEXT,"source_id" TEXT,"approval_state" TEXT);

CREATE TABLE "entity_aliases" ("id" TEXT PRIMARY KEY,"entity_table" TEXT,"entity_id" TEXT,"alias" TEXT,"external_system" TEXT,"valid_from" TEXT,"valid_to" TEXT,"equivalence_reason" TEXT,"review_status" TEXT,"source_id" TEXT);

CREATE TABLE "entity_classifications" ("id" TEXT PRIMARY KEY,"entity_table" TEXT,"entity_id" TEXT,"term_id" TEXT,"origin" TEXT,"method" TEXT,"version" TEXT,"reviewed_at" TEXT,"source_id" TEXT);

CREATE TABLE "evaluation_cases" ("id" TEXT PRIMARY KEY,"title" TEXT,"case_type" TEXT,"company_profile_json" TEXT,"objective" TEXT,"constraints_json" TEXT,"cutoff" TEXT,"candidate_universe" TEXT,"label_origin" TEXT,"split" TEXT,"ground_truth_quality" TEXT);

CREATE TABLE "event_assets" ("id" TEXT PRIMARY KEY,"event_id" TEXT,"asset_type" TEXT,"url" TEXT,"author" TEXT,"language" TEXT,"published_at" TEXT,"rights" TEXT,"locator" TEXT,"source_id" TEXT);

CREATE TABLE "event_company_roles" ("id" TEXT PRIMARY KEY,"event_id" TEXT,"company_id" TEXT,"role" TEXT,"level" TEXT,"relationship_status" TEXT,"valid_from" TEXT,"valid_to" TEXT,"source_id" TEXT);

CREATE TABLE "event_concepts" ("id" TEXT PRIMARY KEY,"brief_id" TEXT,"title" TEXT,"objective" TEXT,"audience" TEXT,"format" TEXT,"proposed_location" TEXT,"proposed_date" TEXT,"rationale" TEXT,"evidence_ids_json" TEXT,"estimated_budget" TEXT,"currency" TEXT,"pending_decisions_json" TEXT,"status" TEXT);

CREATE TABLE "event_costs" ("id" TEXT PRIMARY KEY,"event_id" TEXT,"category" TEXT,"amount_min" TEXT,"amount_max" TEXT,"currency" TEXT,"unit" TEXT,"taxes" TEXT,"inclusions" TEXT,"valid_from" TEXT,"valid_to" TEXT,"cost_status" TEXT,"source_id" TEXT);

CREATE TABLE "event_deadlines" ("id" TEXT PRIMARY KEY,"event_id" TEXT,"deadline_type" TEXT,"date" TEXT,"date_precision" TEXT,"timezone" TEXT,"status" TEXT,"requirements" TEXT,"source_id" TEXT);

CREATE TABLE "event_editions" ("id" TEXT PRIMARY KEY,"series_id" TEXT,"title" TEXT,"canonical_url" TEXT,"start_date" TEXT,"end_date" TEXT,"start_at" TEXT,"end_at" TEXT,"timezone" TEXT,"date_precision" TEXT,"end_semantics" TEXT,"status" TEXT,"temporal_bucket" TEXT,"location_raw" TEXT,"country" TEXT,"modality" TEXT,"geo_precision" TEXT,"venue_id" TEXT,"format" TEXT,"sector" TEXT,"topics_json" TEXT,"language" TEXT,"registration_status" TEXT,"last_verified" TEXT,"source_id" TEXT,"missing_reasons_json" TEXT);

CREATE TABLE "event_metrics" ("id" TEXT PRIMARY KEY,"event_id" TEXT,"company_id" TEXT,"metric" TEXT,"value" TEXT,"unit" TEXT,"denominator" TEXT,"period" TEXT,"attribution_method" TEXT,"metric_status" TEXT,"source_id" TEXT);

CREATE TABLE "event_relations" ("id" TEXT PRIMARY KEY,"from_event_id" TEXT,"to_event_id" TEXT,"relation_type" TEXT,"origin" TEXT,"source_id" TEXT);

CREATE TABLE "event_series" ("id" TEXT PRIMARY KEY,"name" TEXT,"url" TEXT,"identity_method" TEXT,"periodicity" TEXT,"source_id" TEXT);

CREATE TABLE "event_space_assignments" ("id" TEXT PRIMARY KEY,"event_id" TEXT,"session_id" TEXT,"space_id" TEXT,"start_at" TEXT,"end_at" TEXT,"status" TEXT,"source_id" TEXT);

CREATE TABLE "event_status_history" ("id" TEXT PRIMARY KEY,"event_id" TEXT,"previous_status" TEXT,"new_status" TEXT,"announced_at" TEXT,"effective_at" TEXT,"reason" TEXT,"source_id" TEXT);

CREATE TABLE "extraction_queue" ("id" TEXT PRIMARY KEY,"source_url" TEXT,"family" TEXT,"geography" TEXT,"segment" TEXT,"window_start" TEXT,"window_end" TEXT,"priority" TEXT,"status" TEXT,"last_processed" TEXT,"cursor" TEXT,"blocking_reason" TEXT,"attempts" TEXT,"next_action" TEXT,"completion_condition" TEXT);

CREATE TABLE "fetch_attempts" ("id" TEXT PRIMARY KEY,"run_id" TEXT,"url" TEXT,"observed_at" TEXT,"result" TEXT,"error_class" TEXT,"duration_ms" TEXT,"attempt_number" TEXT,"next_step" TEXT);

CREATE TABLE "luma_drafts" ("id" TEXT PRIMARY KEY,"concept_id" TEXT,"title" TEXT,"description" TEXT,"agenda_json" TEXT,"supported_fields_json" TEXT,"local_state" TEXT,"version" TEXT,"pending_decisions_json" TEXT,"luma_event_id" TEXT);

CREATE TABLE "market_context" ("id" TEXT PRIMARY KEY,"region" TEXT,"sector" TEXT,"variable" TEXT,"value" TEXT,"unit" TEXT,"period" TEXT,"decision_link" TEXT,"source_id" TEXT);

CREATE TABLE "news_articles" ("id" TEXT PRIMARY KEY,"source_id" TEXT,"title" TEXT,"publisher" TEXT,"author" TEXT,"url" TEXT,"language" TEXT,"published_at" TEXT,"updated_at" TEXT,"editorial_type" TEXT,"summary" TEXT,"event_date" TEXT,"access_status" TEXT);

CREATE TABLE "news_dedup_clusters" ("id" TEXT PRIMARY KEY,"article_id" TEXT,"cluster_id" TEXT,"original_article_id" TEXT,"relationship" TEXT,"independence_basis" TEXT,"source_id" TEXT);

CREATE TABLE "news_entity_links" ("id" TEXT PRIMARY KEY,"article_id" TEXT,"entity_table" TEXT,"entity_id" TEXT,"mention_type" TEXT,"assertion_id" TEXT,"valid_from" TEXT,"valid_to" TEXT,"source_id" TEXT);

CREATE TABLE "opportunity_clusters" ("id" TEXT PRIMARY KEY,"region" TEXT,"audience" TEXT,"topic" TEXT,"format" TEXT,"period" TEXT,"observed_supply" TEXT,"demand_evidence" TEXT,"costs" TEXT,"gaps" TEXT,"method" TEXT,"version" TEXT,"input_ids_json" TEXT,"cutoff" TEXT);

CREATE TABLE "participation" ("id" TEXT PRIMARY KEY,"person_id" TEXT,"event_id" TEXT,"company_id" TEXT,"role" TEXT,"historical_job_title" TEXT,"participation_status" TEXT,"source_id" TEXT);

CREATE TABLE "partner_relationships" ("id" TEXT PRIMARY KEY,"company_a_id" TEXT,"company_b_id" TEXT,"relationship_type" TEXT,"stated_objective" TEXT,"valid_from" TEXT,"valid_to" TEXT,"event_id" TEXT,"source_id" TEXT);

CREATE TABLE "people" ("id" TEXT PRIMARY KEY,"name" TEXT,"professional_url" TEXT,"missing_reasons_json" TEXT,"source_id" TEXT);

CREATE TABLE "platform_listings" ("id" TEXT PRIMARY KEY,"event_id" TEXT,"platform" TEXT,"native_id" TEXT,"url" TEXT,"first_observed" TEXT,"last_observed" TEXT,"listing_status" TEXT,"evidence_method" TEXT,"source_id" TEXT);

CREATE TABLE "professional_affiliations" ("id" TEXT PRIMARY KEY,"person_id" TEXT,"company_id" TEXT,"role" TEXT,"valid_from" TEXT,"valid_to" TEXT,"event_id" TEXT,"source_id" TEXT);

CREATE TABLE "recommendation_candidates" ("id" TEXT PRIMARY KEY,"run_id" TEXT,"event_id" TEXT,"eligibility" TEXT,"score_components_json" TEXT,"rank" TEXT,"evidence_ids_json" TEXT,"missing_fields_json" TEXT,"explanation" TEXT,"human_label" TEXT);

CREATE TABLE "recommendation_runs" ("id" TEXT PRIMARY KEY,"case_id" TEXT,"cutoff" TEXT,"dataset_version" TEXT,"method" TEXT,"parameters_json" TEXT,"model_version" TEXT,"elapsed_ms" TEXT,"measured_cost_usd" TEXT,"billing_status" TEXT);

CREATE TABLE "record_versions" ("id" TEXT PRIMARY KEY,"entity_table" TEXT,"entity_id" TEXT,"version" TEXT,"previous_value_json" TEXT,"new_value_json" TEXT,"valid_from" TEXT,"valid_to" TEXT,"observed_at" TEXT,"source_id" TEXT,"change_reason" TEXT);

CREATE TABLE scale_batches(id TEXT PRIMARY KEY,path TEXT NOT NULL,sha256 TEXT NOT NULL,rows_read INTEGER NOT NULL,metadata_json TEXT NOT NULL);

CREATE TABLE scale_dedupe_candidates(id TEXT PRIMARY KEY,event_a TEXT NOT NULL REFERENCES event_editions(id),event_b TEXT NOT NULL REFERENCES event_editions(id),reason TEXT NOT NULL,status TEXT NOT NULL);

CREATE TABLE scale_enrichment_observations(id TEXT PRIMARY KEY,entity_table TEXT,entity_id TEXT,source_id TEXT REFERENCES sources(id),payload_json TEXT NOT NULL);

CREATE TABLE scale_event_metadata(event_id TEXT PRIMARY KEY REFERENCES event_editions(id),source_family TEXT NOT NULL,native_id TEXT,record_type TEXT NOT NULL,city TEXT,country_normalized TEXT,category TEXT,latitude REAL,longitude REAL,geo_precision TEXT,geo_method TEXT,geo_verification TEXT,source_modified_at TEXT,parent_native_id TEXT,original_data_source TEXT,license TEXT,inherited INTEGER NOT NULL CHECK(inherited IN (0,1)));

CREATE VIRTUAL TABLE scale_event_search USING fts5(event_id UNINDEXED,title,location,topics);

CREATE TABLE scale_migrations(id TEXT PRIMARY KEY,description TEXT NOT NULL,version TEXT NOT NULL);

CREATE TABLE scale_observations(id TEXT PRIMARY KEY,event_id TEXT NOT NULL REFERENCES event_editions(id),source_id TEXT NOT NULL REFERENCES sources(id),batch TEXT NOT NULL,native_id TEXT,locator TEXT NOT NULL,observed_at TEXT NOT NULL,content_sha256 TEXT NOT NULL,raw_values_json TEXT NOT NULL,dedupe_decision TEXT NOT NULL);

CREATE TABLE scale_rejections(id TEXT PRIMARY KEY,batch TEXT NOT NULL,locator TEXT,reason TEXT NOT NULL,record_hash TEXT NOT NULL);

CREATE TABLE "scoring_evaluations" ("id" TEXT PRIMARY KEY,"evaluation_set" TEXT,"method" TEXT,"baseline" TEXT,"metric" TEXT,"sample_size" TEXT,"value" TEXT,"definition" TEXT,"uncertainty" TEXT,"limitations" TEXT,"measurement_status" TEXT);

CREATE TABLE "search_queries" ("id" TEXT PRIMARY KEY,"query" TEXT,"service" TEXT,"language" TEXT,"filters_json" TEXT,"geography" TEXT,"window_start" TEXT,"window_end" TEXT,"observed_at" TEXT,"new_sources_count" TEXT,"batch_id" TEXT);

CREATE TABLE "session_participants" ("id" TEXT PRIMARY KEY,"session_id" TEXT,"person_id" TEXT,"company_id" TEXT,"role" TEXT,"historical_affiliation" TEXT,"status" TEXT,"source_id" TEXT);

CREATE TABLE "sessions" ("id" TEXT PRIMARY KEY,"event_id" TEXT,"title" TEXT,"description" TEXT,"topic" TEXT,"track" TEXT,"format" TEXT,"start_at" TEXT,"end_at" TEXT,"space_id" TEXT,"agenda_version" TEXT,"status" TEXT,"source_id" TEXT);

CREATE TABLE "source_snapshots" ("id" TEXT PRIMARY KEY,"source_id" TEXT,"original_url" TEXT,"archive_url" TEXT,"capture_at" TEXT,"observed_at" TEXT,"content_type" TEXT,"sha256" TEXT,"availability" TEXT,"retained_material" TEXT,"retention_basis" TEXT);

CREATE TABLE "sources" ("id" TEXT PRIMARY KEY,"url" TEXT,"canonical_url" TEXT,"publisher" TEXT,"title" TEXT,"source_type" TEXT,"language" TEXT,"published_at" TEXT,"observed_at" TEXT,"access_method" TEXT,"reuse_status" TEXT,"extraction_status" TEXT);

CREATE TABLE "sponsor_match_scores" ("id" TEXT PRIMARY KEY,"company_id" TEXT,"event_id" TEXT,"concept_id" TEXT,"cutoff" TEXT,"criteria_json" TEXT,"constraints_json" TEXT,"history" TEXT,"score" TEXT,"interest_status" TEXT,"uncertainty" TEXT,"method" TEXT,"version" TEXT,"input_ids_json" TEXT);

CREATE TABLE "sponsor_profiles" ("id" TEXT PRIMARY KEY,"company_id" TEXT,"objectives_json" TEXT,"audiences_json" TEXT,"categories_json" TEXT,"geographies_json" TEXT,"proposal_channel" TEXT,"decision_process" TEXT,"budget_amount" TEXT,"currency" TEXT,"missing_reasons_json" TEXT,"source_id" TEXT);

CREATE TABLE "sponsorship_deliverables" ("id" TEXT PRIMARY KEY,"package_id" TEXT,"agreement_id" TEXT,"benefit_type" TEXT,"description" TEXT,"quantity" TEXT,"unit" TEXT,"promised_audience" TEXT,"deadline" TEXT,"compliance_criterion" TEXT,"source_id" TEXT);

CREATE TABLE "sponsorship_history" ("id" TEXT PRIMARY KEY,"company_id" TEXT,"event_id" TEXT,"series_id" TEXT,"package_id" TEXT,"level" TEXT,"period" TEXT,"status" TEXT,"modality" TEXT,"amount" TEXT,"currency" TEXT,"source_id" TEXT);

CREATE TABLE "sponsorship_observations" ("id" TEXT PRIMARY KEY,"agreement_id" TEXT,"deliverable_id" TEXT,"event_id" TEXT,"observed_at" TEXT,"observation" TEXT,"status" TEXT,"metrics_json" TEXT,"source_id" TEXT);

CREATE TABLE "sponsorship_packages" ("id" TEXT PRIMARY KEY,"event_id" TEXT,"name" TEXT,"amount_min" TEXT,"amount_max" TEXT,"currency" TEXT,"benefits_json" TEXT,"exclusivity" TEXT,"inventory" TEXT,"availability" TEXT,"valid_from" TEXT,"valid_to" TEXT,"deadline" TEXT,"source_id" TEXT);

CREATE TABLE "sponsorship_renewals" ("id" TEXT PRIMARY KEY,"company_id" TEXT,"series_id" TEXT,"previous_event_id" TEXT,"next_event_id" TEXT,"previous_level" TEXT,"next_level" TEXT,"classification" TEXT,"coverage_basis" TEXT,"method" TEXT,"version" TEXT,"input_ids_json" TEXT,"cutoff" TEXT);

CREATE TABLE "taxonomy_terms" ("id" TEXT PRIMARY KEY,"category" TEXT,"term" TEXT,"definition" TEXT,"parent_id" TEXT,"synonyms_json" TEXT,"language" TEXT,"version" TEXT);

CREATE TABLE "ticket_price_history" ("id" TEXT PRIMARY KEY,"ticket_id" TEXT,"amount" TEXT,"currency" TEXT,"fees" TEXT,"taxes" TEXT,"sale_phase" TEXT,"observed_at" TEXT,"valid_from" TEXT,"valid_to" TEXT,"availability" TEXT,"source_id" TEXT);

CREATE TABLE "ticket_types" ("id" TEXT PRIMARY KEY,"event_id" TEXT,"name" TEXT,"eligibility" TEXT,"benefits_json" TEXT,"payment_mode" TEXT,"capacity" TEXT,"currency" TEXT,"source_id" TEXT);

CREATE TABLE "topic_trends" ("id" TEXT PRIMARY KEY,"term_id" TEXT,"geography" TEXT,"sector" TEXT,"period" TEXT,"universe" TEXT,"count" TEXT,"normalized_value" TEXT,"method" TEXT,"version" TEXT,"input_ids_json" TEXT,"cutoff" TEXT);

CREATE TABLE "unit_economics_scenarios" ("id" TEXT PRIMARY KEY,"volume" TEXT,"frequency" TEXT,"data_usd" TEXT,"models_usd" TEXT,"maps_usd" TEXT,"storage_usd" TEXT,"human_usd" TEXT,"total_usd" TEXT,"cost_per_useful_result" TEXT,"assumptions_json" TEXT,"estimate_or_measured" TEXT);

CREATE TABLE "user_feedback" ("id" TEXT PRIMARY KEY,"brief_id" TEXT,"proposal_id" TEXT,"feedback_type" TEXT,"reason" TEXT,"observed_at" TEXT,"later_outcome_json" TEXT);

CREATE TABLE "venue_spaces" ("id" TEXT PRIMARY KEY,"venue_id" TEXT,"name" TEXT,"configuration" TEXT,"capacity" TEXT,"services_json" TEXT,"accessibility" TEXT,"valid_from" TEXT,"valid_to" TEXT,"source_id" TEXT);

CREATE TABLE "venues" ("id" TEXT PRIMARY KEY,"name" TEXT,"address" TEXT,"city" TEXT,"country" TEXT,"latitude" TEXT,"longitude" TEXT,"geo_method" TEXT,"geo_precision" TEXT,"capacity" TEXT,"capacity_format" TEXT,"url" TEXT,"business_channel" TEXT,"source_id" TEXT);