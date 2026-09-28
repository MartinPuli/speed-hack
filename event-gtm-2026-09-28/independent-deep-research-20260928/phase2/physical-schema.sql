-- DESIGN ARTIFACT ONLY. Not deployed, migrated or tested against PostgreSQL.
-- Research interchange SQLite stays separate. Scope 00000000-0000-0000-0000-000000000000 = public catalog.
CREATE SCHEMA event_gtm_design;
SET search_path TO event_gtm_design;
CREATE TABLE scopes (id uuid PRIMARY KEY, kind text NOT NULL CHECK(kind IN ('public','tenant')), name text NOT NULL);
CREATE TABLE entities (
 scope_id uuid NOT NULL REFERENCES scopes, id text NOT NULL, kind text NOT NULL, name text NOT NULL,
 canonical_url text, attributes jsonb NOT NULL DEFAULT '{}', version integer NOT NULL DEFAULT 1,
 observed_at timestamptz NOT NULL, deleted_at timestamptz, PRIMARY KEY(scope_id,id)
);
CREATE TABLE sources (
 scope_id uuid NOT NULL REFERENCES scopes,id text NOT NULL,url text NOT NULL,publisher text,
 source_type text NOT NULL,rights jsonb NOT NULL,access_status text NOT NULL,
 published_at timestamptz,observed_at timestamptz NOT NULL,PRIMARY KEY(scope_id,id),UNIQUE(scope_id,url)
);
CREATE TABLE source_snapshots (
 scope_id uuid NOT NULL,id text NOT NULL,source_id text NOT NULL,observed_at timestamptz NOT NULL,
 captured_at timestamptz,http_status integer,sha256 text,permitted_object_key text,metadata jsonb NOT NULL,
 PRIMARY KEY(scope_id,id),FOREIGN KEY(scope_id,source_id) REFERENCES sources(scope_id,id)
);
CREATE TABLE assertions (
 scope_id uuid NOT NULL,id text NOT NULL,entity_id text NOT NULL,source_id text NOT NULL,
 snapshot_id text,field text NOT NULL,value jsonb NOT NULL,locator text NOT NULL,
 evidence_class text NOT NULL,field_access text NOT NULL,confidence_basis text NOT NULL,
 valid_from date,valid_to date,observed_at timestamptz NOT NULL,supersedes_id text,conflict_group text,
 PRIMARY KEY(scope_id,id),FOREIGN KEY(scope_id,entity_id) REFERENCES entities(scope_id,id),
 FOREIGN KEY(scope_id,source_id) REFERENCES sources(scope_id,id),
 FOREIGN KEY(scope_id,snapshot_id) REFERENCES source_snapshots(scope_id,id),
 FOREIGN KEY(scope_id,supersedes_id) REFERENCES assertions(scope_id,id),CHECK(valid_to IS NULL OR valid_from IS NULL OR valid_to>=valid_from)
);
CREATE TABLE event_editions (
 scope_id uuid NOT NULL,id text NOT NULL,series_id text,title text NOT NULL,start_date date NOT NULL,end_date date,
 start_at timestamptz,end_at timestamptz,local_time_without_zone text,timezone text,
 country_code text,city text,venue_id text,latitude double precision,longitude double precision,geo_precision text NOT NULL,
 format text,sector text,modality text,status text NOT NULL,critical_verified_at timestamptz,
 eligibility_status text NOT NULL,PRIMARY KEY(scope_id,id),FOREIGN KEY(scope_id,id) REFERENCES entities(scope_id,id),
 FOREIGN KEY(scope_id,series_id) REFERENCES entities(scope_id,id),FOREIGN KEY(scope_id,venue_id) REFERENCES entities(scope_id,id),
 CHECK(end_date IS NULL OR end_date>=start_date),CHECK(latitude IS NULL OR latitude BETWEEN -90 AND 90),
 CHECK(longitude IS NULL OR longitude BETWEEN -180 AND 180),CHECK((latitude IS NULL)=(longitude IS NULL))
);
CREATE TABLE profiles (
 scope_id uuid NOT NULL,id text NOT NULL,entity_id text NOT NULL,version integer NOT NULL,valid_from date,valid_to date,
 payload jsonb NOT NULL,assertion_ids text[] NOT NULL,PRIMARY KEY(scope_id,id),FOREIGN KEY(scope_id,entity_id) REFERENCES entities(scope_id,id)
);
CREATE TABLE relations (
 scope_id uuid NOT NULL,id text NOT NULL,subject_id text NOT NULL,object_id text NOT NULL,kind text NOT NULL,
 event_id text,valid_from date,valid_to date,observed_at timestamptz NOT NULL,status text NOT NULL,payload jsonb NOT NULL,
 assertion_ids text[] NOT NULL,PRIMARY KEY(scope_id,id),FOREIGN KEY(scope_id,subject_id) REFERENCES entities(scope_id,id),
 FOREIGN KEY(scope_id,object_id) REFERENCES entities(scope_id,id),FOREIGN KEY(scope_id,event_id) REFERENCES event_editions(scope_id,id)
);
CREATE TABLE measurements (
 scope_id uuid NOT NULL,id text NOT NULL,entity_id text NOT NULL,metric text NOT NULL,numeric_value numeric,text_value text,
 unit text NOT NULL,currency char(3),denominator numeric,period text,method text NOT NULL,status text NOT NULL,
 payload jsonb NOT NULL,assertion_ids text[] NOT NULL,PRIMARY KEY(scope_id,id),FOREIGN KEY(scope_id,entity_id) REFERENCES entities(scope_id,id),
 CHECK(numeric_value IS NOT NULL OR text_value IS NOT NULL)
);
CREATE TABLE offers (
 scope_id uuid NOT NULL,id text NOT NULL,event_id text NOT NULL,kind text NOT NULL,name text NOT NULL,eligibility jsonb NOT NULL,
 benefits jsonb NOT NULL,PRIMARY KEY(scope_id,id),FOREIGN KEY(scope_id,event_id) REFERENCES event_editions(scope_id,id)
);
CREATE TABLE offer_versions (
 scope_id uuid NOT NULL,id text NOT NULL,offer_id text NOT NULL,amount_min numeric,amount_max numeric,currency char(3),
 fee_tax_basis text NOT NULL,valid_from date,valid_to date,observed_at timestamptz NOT NULL,availability text NOT NULL,
 assertion_ids text[] NOT NULL,payload jsonb NOT NULL,PRIMARY KEY(scope_id,id),FOREIGN KEY(scope_id,offer_id) REFERENCES offers(scope_id,id),
 CHECK(amount_min IS NULL OR amount_min>=0),CHECK(amount_max IS NULL OR amount_min IS NULL OR amount_max>=amount_min)
);
CREATE TABLE external_ids (
 scope_id uuid NOT NULL,id text NOT NULL,entity_id text NOT NULL,platform text NOT NULL,native_id text,url text NOT NULL,
 status text NOT NULL,observed_at timestamptz NOT NULL,PRIMARY KEY(scope_id,id),FOREIGN KEY(scope_id,entity_id) REFERENCES entities(scope_id,id)
);
CREATE TABLE entity_aliases (
 scope_id uuid NOT NULL,id text NOT NULL,entity_id text NOT NULL,alias text NOT NULL,valid_from date,valid_to date,
 reason text NOT NULL,review_status text NOT NULL,assertion_ids text[] NOT NULL,PRIMARY KEY(scope_id,id),
 FOREIGN KEY(scope_id,entity_id) REFERENCES entities(scope_id,id)
);
CREATE TABLE changes (
 scope_id uuid NOT NULL,id text NOT NULL,entity_id text NOT NULL,kind text NOT NULL,field text,previous_value jsonb,new_value jsonb,
 resolution text,observed_at timestamptz NOT NULL,effective_at date,payload jsonb NOT NULL,PRIMARY KEY(scope_id,id),
 FOREIGN KEY(scope_id,entity_id) REFERENCES entities(scope_id,id)
);
CREATE TABLE jobs (
 scope_id uuid NOT NULL,id text NOT NULL,kind text NOT NULL,state text NOT NULL,idempotency_key text NOT NULL,
 next_run_at timestamptz,lease_until timestamptz,attempts integer NOT NULL DEFAULT 0,max_attempts integer NOT NULL DEFAULT 3,
 input jsonb NOT NULL,cursor jsonb,budget_usd numeric,spent_usd numeric NOT NULL DEFAULT 0,PRIMARY KEY(scope_id,id),UNIQUE(scope_id,idempotency_key)
);
CREATE TABLE job_steps (
 scope_id uuid NOT NULL,id text NOT NULL,job_id text NOT NULL,kind text NOT NULL,state text NOT NULL,
 started_at timestamptz,finished_at timestamptz,latency_ms numeric,actual_cost_usd numeric,
 input_refs jsonb NOT NULL,result jsonb NOT NULL,error jsonb,PRIMARY KEY(scope_id,id),FOREIGN KEY(scope_id,job_id) REFERENCES jobs(scope_id,id)
);
CREATE TABLE deadlines (
 scope_id uuid NOT NULL,id text NOT NULL,event_id text NOT NULL,kind text NOT NULL,date_value date,instant_value timestamptz,
 timezone text,status text NOT NULL,assertion_ids text[] NOT NULL,PRIMARY KEY(scope_id,id),FOREIGN KEY(scope_id,event_id) REFERENCES event_editions(scope_id,id)
);
CREATE TABLE briefs (
 scope_id uuid NOT NULL,id text NOT NULL,version integer NOT NULL,origin text NOT NULL CHECK(origin IN ('customer','synthetic_evaluation')),
 profile jsonb NOT NULL,constraints jsonb NOT NULL,confirmed_fields text[] NOT NULL,created_at timestamptz NOT NULL,PRIMARY KEY(scope_id,id)
);
CREATE TABLE runs (
 scope_id uuid NOT NULL,id text NOT NULL,brief_id text NOT NULL,cutoff timestamptz NOT NULL,dataset_version text NOT NULL,
 method_version text NOT NULL,model_id text,parameters jsonb NOT NULL,usage jsonb NOT NULL,cost_usd numeric,state text NOT NULL,
 PRIMARY KEY(scope_id,id),FOREIGN KEY(scope_id,brief_id) REFERENCES briefs(scope_id,id)
);
CREATE TABLE candidates (
 scope_id uuid NOT NULL,id text NOT NULL,run_id text NOT NULL,catalog_scope_id uuid NOT NULL,event_id text NOT NULL,
 rank integer,eligibility text NOT NULL,components jsonb NOT NULL,evidence_packet jsonb NOT NULL,
 PRIMARY KEY(scope_id,id),FOREIGN KEY(scope_id,run_id) REFERENCES runs(scope_id,id),
 FOREIGN KEY(catalog_scope_id,event_id) REFERENCES event_editions(scope_id,id),CHECK(rank IS NULL OR rank>0)
);
CREATE TABLE artifacts (
 scope_id uuid NOT NULL,id text NOT NULL,kind text NOT NULL,brief_id text,version integer NOT NULL,status text NOT NULL,
 payload jsonb NOT NULL,lineage jsonb NOT NULL,created_at timestamptz NOT NULL,PRIMARY KEY(scope_id,id),
 FOREIGN KEY(scope_id,brief_id) REFERENCES briefs(scope_id,id)
);
CREATE TABLE feedback (
 scope_id uuid NOT NULL,id text NOT NULL,brief_id text NOT NULL,run_id text,kind text NOT NULL,payload jsonb NOT NULL,
 observed_at timestamptz NOT NULL,PRIMARY KEY(scope_id,id),FOREIGN KEY(scope_id,brief_id) REFERENCES briefs(scope_id,id),
 FOREIGN KEY(scope_id,run_id) REFERENCES runs(scope_id,id)
);
CREATE TABLE search_documents (
 scope_id uuid NOT NULL,id text NOT NULL,entity_id text NOT NULL,language text NOT NULL,text_body text NOT NULL,
 search_vector tsvector NOT NULL,content_hash text NOT NULL,version integer NOT NULL,evidence_ids text[] NOT NULL,
 PRIMARY KEY(scope_id,id),FOREIGN KEY(scope_id,entity_id) REFERENCES entities(scope_id,id)
);
CREATE INDEX events_filter ON event_editions(scope_id,country_code,start_date) WHERE status<>'cancelled';
CREATE INDEX assertions_lookup ON assertions(scope_id,entity_id,field,observed_at DESC);
CREATE INDEX relations_from ON relations(scope_id,subject_id,kind);
CREATE INDEX relations_to ON relations(scope_id,object_id,kind);
CREATE INDEX measurements_lookup ON measurements(scope_id,entity_id,metric,period);
CREATE INDEX search_document_fts ON search_documents USING gin(search_vector);
CREATE INDEX jobs_due ON jobs(next_run_at) WHERE state IN ('queued','retry');
-- Access design: restrict role and set trusted app.scope_id server-side before queries.
-- The serving role must not own these tables and must not have BYPASSRLS.
-- Workers use a separate least-privilege role; do not expose SQL or scope setting to models/end users.
DO $$ DECLARE r record; BEGIN
 FOR r IN SELECT tablename FROM pg_tables WHERE schemaname='event_gtm_design' AND tablename<>'scopes' LOOP
  EXECUTE format('ALTER TABLE event_gtm_design.%I ENABLE ROW LEVEL SECURITY',r.tablename);
  EXECUTE format('ALTER TABLE event_gtm_design.%I FORCE ROW LEVEL SECURITY',r.tablename);
  EXECUTE format('CREATE POLICY scoped_read ON event_gtm_design.%I FOR SELECT USING (scope_id = current_setting(''app.scope_id'',true)::uuid OR scope_id = ''00000000-0000-0000-0000-000000000000''::uuid)',r.tablename);
  EXECUTE format('CREATE POLICY scoped_write ON event_gtm_design.%I FOR ALL USING (scope_id = current_setting(''app.scope_id'',true)::uuid AND scope_id <> ''00000000-0000-0000-0000-000000000000''::uuid) WITH CHECK (scope_id = current_setting(''app.scope_id'',true)::uuid AND scope_id <> ''00000000-0000-0000-0000-000000000000''::uuid)',r.tablename);
 END LOOP;
END $$;
-- A migration must add controlled public-catalog ingestion policy/grants, JSON schemas, semantic kind checks,
-- and FK validation for assertion_ids arrays, lineage and artifact field targets before production use.
-- Keeping these explicit avoids claiming this design artifact is a deployable tenant-security solution.
