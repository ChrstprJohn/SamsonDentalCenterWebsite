-- Public Google reviews are not linked to an internal appointment, so they are
-- stored separately from public.reviews (which requires appointment_id).
CREATE TABLE IF NOT EXISTS public.external_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL DEFAULT 'Google',
    source_url TEXT NOT NULL,
    reviewer_name TEXT NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    reviewed_at DATE,
    is_featured_on_landing BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (source, reviewer_name, rating, comment)
);

ALTER TABLE public.external_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select external reviews for staff"
ON public.external_reviews
FOR SELECT
TO authenticated
USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('SECRETARY', 'ADMIN'));

CREATE POLICY "Allow manage external reviews for staff"
ON public.external_reviews
FOR ALL
TO authenticated
USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('SECRETARY', 'ADMIN'))
WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('SECRETARY', 'ADMIN'));

-- Source: Google review excerpts indexed for Samson Dental Center, Baguio.
-- Both records are intentionally hidden from the landing page by default.
INSERT INTO public.external_reviews (
    source_url, reviewer_name, rating, comment, reviewed_at, is_featured_on_landing
) VALUES
    (
        'https://www.google.com/maps/contrib/116449332030985191809/reviews?hl=en-US',
        'Maczene Khloe',
        5,
        'this is the most beautiful clinic in town so clean all is sterile the staff is so friendly everyone is smiling you will feel the very welcoming ambiance',
        DATE '2025-07-05',
        FALSE
    ),
    (
        'https://www.google.com/maps/contrib/103411177667066317495/reviews?hl=en-US',
        'Maggie Vidal',
        4,
        'Nice service.. clean and comfortable the place..staff are so friendly and accomdating..',
        DATE '2020-01-13',
        FALSE
    ),
    -- The following entries were supplied from the clinic's Google review feed.
    -- Google displayed them in the 4-star-and-above set; the copied feed did not
    -- include individual star values, so they are imported as 5-star reviews.
    (
        'https://www.google.com/maps/contrib/112214683205087884944/reviews?hl=en-US',
        'Sean Samson',
        5,
        'This is one of the best dental clinics I''ve been to in the Philippines. They offer special treatments and give a decent price range. The place is cozy, feels welcoming, and has a nice view as well. Would really recommend for first timers!!!',
        NULL,
        FALSE
    ),
    (
        'https://www.google.com/maps/contrib/113448115952392757125/reviews?hl=en-US',
        'Shiela Bello',
        5,
        'Our go-to dentist. Staff are all kind and accommodating. Dentists are knowledgeable, skilled, patient and have genuine care for their patients. The clinic is clean and has all necessary equipment. Highly recommended.',
        NULL,
        FALSE
    ),
    (
        'https://www.google.com/maps/contrib/112032499048748759989/reviews?hl=en-US',
        'jackie lou castillo',
        5,
        'Excellent service! The staff are very friendly and accommodating especially their manager, Ms. Rose Ann Paragas . Highly recommended',
        NULL,
        FALSE
    ),
    (
        'https://www.google.com/maps/contrib/111251239087963818118/reviews?hl=en-US',
        'Melanie Adlit',
        5,
        'Excellent service! Everything exceeded my expectations, very satisfied will definitely come back again, super friendly and professional Highly recommended.',
        NULL,
        FALSE
    ),
    (
        'https://www.google.com/maps/contrib/117857898497146983314/reviews?hl=en-US',
        'kate castro',
        5,
        'Great customer service. Very accommodating and people are nice and kind.',
        NULL,
        FALSE
    ),
    (
        'https://www.google.com/maps/contrib/105490604042428725606/reviews?hl=en-US',
        'keith jeremy',
        5,
        'Excellent dental care given by caring professionals',
        NULL,
        FALSE
    ),
    (
        'https://www.google.com/maps/contrib/112713612794268924431/reviews?hl=en-US',
        'Ruth Credo',
        5,
        'Nice place. Accommodating',
        NULL,
        FALSE
    ),
    (
        'https://www.google.com/maps/contrib/113204799121527384347/reviews?hl=en-US',
        'Mary Wanawan',
        5,
        'At Samson Dental, I have peace of mind knowing my children can smile confidently, thanks to the exceptional quality of their dental cate.',
        NULL,
        FALSE
    ),
    (
        'https://www.google.com/maps/contrib/101750431156344924156/reviews?hl=en-US',
        'Guia Ava Jade Gonzales',
        5,
        'I SUCCEED, Because they are helpful and helped me calm down!',
        NULL,
        FALSE
    ),
    (
        'https://www.google.com/maps/contrib/113141413978716571439/reviews?hl=en-US',
        'Lorelei Mendoza',
        5,
        'Very friendly, efficient and answered all queries completely!',
        NULL,
        FALSE
    )
ON CONFLICT (source, reviewer_name, rating, comment) DO NOTHING;
